import re
from django.utils.safestring import mark_safe

h1re = re.compile('<h1>(.*?)</h1>')

def replo(m):
    return r'''<div class="h1header"><h1 id="''' + m.group(1).lower().replace('.', '').replace(' ', '_') + '''"><span class="wrap">
        <span class="text">''' + m.group(1) + '''</span>
        <span class="cover">
          <span class="start"></span>
          <span class="middle"></span>
          <span class="end"></span>
        </span>
    </span></h1></div>'''


def repl(m):
    return r'''<div class="h1header2"><h1 id="''' + m.group(1).lower().replace('.', '').replace(' ', '_') + '''"><span class="wrap">
        <span class="text">''' + m.group(1) + '''</span>
    </span></h1></div>'''

def h1_spans(instance, placeholder, rendered_content, original_context):
    return mark_safe(h1re.sub(repl, rendered_content))

 
contre = re.compile('(<div class="container">)(?!<div class="inner">)')

def replc(m):
    return m.group(0).lower() + '''<div class="inner">'''

def container(instance, placeholder, rendered_content, original_context):
    if contre.search(rendered_content):
        return mark_safe(contre.sub(replc, rendered_content)+'</div>')
    return rendered_content

 