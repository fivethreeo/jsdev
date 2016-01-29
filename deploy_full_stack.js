


var format = require('string-format');
var path = require('path');
var fs = require('fs');
var stream = require('stream');
var async = require('async');
var archiver = require('archiver');

var region = 'eu-west-1';
var keyname = 'my-ec2-keypair-name';
var keyname = 'common';
var applicationname = 'aws-django-testproject';
var stackname = applicationname;
var assetsbucketprefix = applicationname + '-';
var assetsbucket = assetsbucketprefix + region;

var AWS = require('aws-sdk');
AWS.config.region = region;

var templates = function(input){
	var output = [];
	for (var i=0;i<input.length;i++) {
		output.push({
			key: 'public/vpc/' + input[i],
			buffer: fs.readFileSync(path.join(__dirname, 'cloudformation', 'vpc-simple-freetier', input[i]))
		});
	}
	return output;
}([
	'django-elasticbeanstalk.cfn.json',
	'django-master.cfn.json',
	'django-resources.cfn.json',
	'django-vpc.cfn.json'
]);

var s3 = new AWS.S3();

async.waterfall([
    function(callback) {
        var params = {
        	Bucket: assetsbucket,
        	ACL: 'private',
        	CreateBucketConfiguration: {
        	    LocationConstraint: region
        	}
        };

        s3.createBucket(params, function(err, data) {
        	if (err) callback(null);  // an error occurred
        	else callback(null); // successful response
        });
    },
    function(callback) {

    	async.each(templates, function (template, eachcallback) {
		        var params = {
		        	Bucket: assetsbucket, /* required */
		        	Key: template.key, /* required */
		        	ACL: 'private',
		        	Body: template.buffer,
		        };

		        s3.putObject(params, function(err, data) {
		        	if (err) throw err;  // an error occurred
		        	else eachcallback(); // successful response
		        });
		    },
	        function () { callback(null); }
	    );
    },
    function(callback) {

		var zip_parts = [];

		var archive = archiver('zip');

		var converter = new stream.Writable({
		  write: function (chunk, encoding, next) {
		    zip_parts.push(chunk);
		    next()
		}});

	    converter.on('finish', function () {
	        var params = {
	        	Bucket: assetsbucket, /* required */
	        	Key: 'public/django.zip', /* required */
	        	ACL: 'private',
	        	Body: Buffer.concat(zip_parts),
	        };

	        s3.putObject(params, function(err, data) {
	        	if (err) throw err;  // an error occurred
	        	else callback(null); // successful response
	        });
	    })

		console.log('Zipping django deployment to buffer...');

		archive.directory(path.join(__dirname, 'django'), '');

		archive.pipe(converter);

		archive.finalize();
    },
    function(callback) {
    	var ec2 = new AWS.EC2();

        var params = {
        	DryRun: false,
        };

        ec2.describeAvailabilityZones(params, function(err, data) {
        	if (err) throw err;  // an error occurred
        	else callback(null, data); // successful response
        });
    },
    function(zonedata, callback) {

    	var cloudformation = new AWS.CloudFormation();
		        
		var params = {
		  StackName: stackname, // required
		  Capabilities: [
		    'CAPABILITY_IAM'
		  ],
		  OnFailure: 'ROLLBACK',
		  Parameters: [
			  {
			    "ParameterKey": "ApplicationName",
			    "ParameterValue": applicationname
			  },
			  {
			    "ParameterKey": "AssetsBucketPrefix",
			    "ParameterValue": assetsbucketprefix
			  },
			  {
			    "ParameterKey": "KeyName",
			    "ParameterValue": keyname
			  },
			  {
			    "ParameterKey": "VPCAvailabilityZone1",
			    "ParameterValue": zonedata.AvailabilityZones[0].ZoneName
			  },
			  {
			    "ParameterKey": "VPCAvailabilityZone2",
			    "ParameterValue": zonedata.AvailabilityZones[1].ZoneName
			  },
			  {
			    "ParameterKey": "ElasticsearchDomainName",
			    "ParameterValue": 'djangosearch'
			  }
		  ],
		  TemplateURL: ["http://", assetsbucket, ".s3.amazonaws.com/", "public/vpc/django-master.cfn.json"].join('')
		};

        cloudformation.createStack(params, function(err, data) {
            if (err) throw err; // an error occurred
            else callback();      // successful response
        });

    }],
    function() {
    	console.log('Full stack deployed!');
    }
);
