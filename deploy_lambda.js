/*
    npm install archiver --save
    npm install async --save
    npm install string-format --save
*/

const real_exec = require('child_process').exec,
  async = require('async'),
  format = require('string-format'),
  path = require('path'),
  os = require('os'),
  fs = require('fs'),
  archiver = require('archiver');

function exec(cmd, options, cb){
  return real_exec(cmd, options, function(_error, _stdout, _stderr) {
    // console.log(cmd);
    console.log(_stderr);
    return cb(_error, _stdout, _stderr);
  });
}

const aws_cmds = {

  'get-user': 'aws iam get-user \
--output json \
--region "{REGION}"',

  'create-role': 'aws iam create-role \
--role-name "{FULL_NAME}" \
--assume-role-policy-document "{TRUST_ARG}"',

  'update-assume-role-policy': 'aws iam update-assume-role-policy \
--role-name "{FULL_NAME}" \
--policy-document "{TRUST_ARG}"',

  'put-role-policy': 'aws iam put-role-policy \
--role-name "{FULL_NAME}" \
--policy-name "{FULL_NAME}_policy" \
--policy-document "{POLICY_ARG}"',

  'lambda create-function': 'aws --region "{REGION}" lambda create-function \
--function-name "{FULL_NAME}" \
--runtime nodejs \
--role "{ROLE_ARN}" \
--handler \'index.handler\' \
--description "{LAMBDA_DESC}" \
--timeout 300 \
--memory-size 128 \
--zip-file "{ZIP_ARG}"',

  'lambda update-function-configuration': 'aws --region "{REGION}" lambda update-function-configuration \
--function-name "{FULL_NAME}" \
--role "{ROLE_ARN}" \
--handler \'index.handler\' \
--description "{LAMBDA_DESC}" \
--timeout 300 \
--memory-size 128',

  'lambda update-function-code': 'aws --region "{REGION}" lambda update-function-code \
--function-name "{FULL_NAME}" \
--zip-file "{ZIP_ARG}"'
};

var command_opts = {},
  default_region = 'us-east-1',
  regions =  ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-northeast-1'],
  resource_dir = path.join(__dirname, 'node_modules', 'cfn-elasticsearch-domain'); 

var resource_info = require(path.join(resource_dir, 'package.json'));
    
resource_info['version'] = resource_info['version'].replace(/\./g, '-');
  
var FULL_NAME = format("{name}-{version}", resource_info);
var ZIP_LOCATION = path.join(os.tmpdir(), FULL_NAME + '.zip');

var command_vars = {
  'ZIP_LOCATION': ZIP_LOCATION,
  'ZIP_ARG': 'fileb://' + ZIP_LOCATION, 
  'FULL_NAME': FULL_NAME,
  'POLICY_ARG': 'file://' + path.join(resource_dir, 'execution-policy.json'),
  'TRUST_ARG': 'file://' + path.join(resource_dir, 'node_modules', 'cfn-lambda', 'lib', 'lambda.trust.json'),
  'REGION': default_region,
  'LAMBDA_DESC': format('CloudFormation Custom Resource service for Custom::{}', FULL_NAME)
};

var output = fs.createWriteStream(ZIP_LOCATION);
var archive = archiver('zip', {store: true});

output.on('close', start_deploy);

archive.on('error', function(err){
    throw err;
});

console.log(format('Zipping Lambda bundle to {}...', ZIP_LOCATION));

archive.directory(resource_dir, '');

archive.pipe(output);

archive.finalize();

console.log('~~~~ Deploying Lambda to all regions (' + regions.join(' ') + '). You may see CREATE errors ~~~~');
console.log('~~~~ This is fine, it simply means that the deployment script will run UPDATEs ~~~~');

function start_deploy() {
  exec(format(aws_cmds['get-user'], command_vars), command_opts, handle_roles);
}

function handle_roles(error, stdout, stderr) {

  var user_info = JSON.parse(stdout);
  var account_re = /arn:aws:iam::(.*?):user.*/

  command_vars['ACCOUNT_NUMBER'] = user_info['User']['Arn'].replace(account_re, '$1');
 
  command_vars['ROLE_ARN'] = format('arn:aws:iam::{ACCOUNT_NUMBER}:role/{FULL_NAME}', command_vars);

  async.waterfall([
      function(callback) {
        exec(format(aws_cmds['create-role'], command_vars), command_opts, function(_error, _stdout, _stderr) {
            callback(null, _error, _stdout, _stderr);
        })
      },
      function(error, stdout, stderr, callback) {
        exec(format(aws_cmds['update-assume-role-policy'], command_vars), command_opts, function(_error, _stdout, _stderr) {
            callback(null, _error, _stdout, _stderr);
            console.log('Upserted Role!');
        })
      },
      function(error, stdout, stderr, callback) {
        exec(format(aws_cmds['put-role-policy'], command_vars), command_opts, function(_error, _stdout, _stderr) {
          console.log('Added Policy!');
          console.log("Sleeping 5 seconds for policy to propagate.");
          setTimeout(function() {
            callback(null, _error, _stdout, _stderr);
          }, 5000);
        });
      }],
    handle_regions); 
  }

function handle_regions(err, error, stdout, stderr) {
  console.log('Beginning deploy of Lambdas to Regions: ' + regions.join(' '));

  async.each(regions, handle_region, function () { // region_callback
    console.log('~~~~ All done! Lambdas are deployed globally and ready for use by CloudFormation. ~~~~');
    console.log('~~~~                They are accessible to your CloudFormation at:                ~~~~');
    console.log(format('aws:arn:<region>:{ACCOUNT_NUMBER}:function:{FULL_NAME}', command_vars));
  });
}

function handle_region(region, region_callback) { 

  console.log('Deploying Lambda to: ' + region);

  command_vars['REGION'] = region;

  async.waterfall([
      function(callback) {
          exec(format(aws_cmds['lambda create-function'], command_vars), command_opts, function(_error, _stdout, _stderr) {
            callback(null, _error, _stdout, _stderr);
          });
      },
      function(error, stdout, stderr, callback) {
          exec(format(aws_cmds['lambda update-function-configuration'], command_vars), command_opts, function(_error, _stdout, _stderr) {
            callback(null, _error, _stdout, _stderr);
        })
      },
      function(error, stdout, stderr, callback) {
        exec(format(aws_cmds['lambda update-function-code'], command_vars), command_opts, function(_error, _stdout, _stderr) {
          callback(null, _error, _stdout, _stderr);
        });
      }
    ],
    function (err, error, stdout, stderr) {
      console.log(format('Upserted lambda on {}', region));
      region_callback();
    }
  );
}  