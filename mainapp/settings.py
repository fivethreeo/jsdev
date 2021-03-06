import os
gettext = lambda s: s
_ = lambda s: s

DATA_DIR = os.path.dirname(os.path.dirname(__file__))
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SECRET_KEY = '+zqs41e&00r0he-fucf+x(@4@4^&ig7_dmv182i4ui3ntxn2h6'


DEBUG = True

ALLOWED_HOSTS = ['127.0.0.1', 'localhost']

ROOT_URLCONF = 'mainapp.urls'

WSGI_APPLICATION = 'mainapp.wsgi.application'

LANGUAGE_CODE = 'nb'

TIME_ZONE = 'Europe/Oslo'

USE_I18N = True

USE_L10N = True

USE_TZ = True

MEDIA_ROOT = os.path.join(DATA_DIR, 'media')
STATIC_ROOT = os.path.join(DATA_DIR, 'static')

STATIC_URL = '/static/'
MEDIA_URL = '/media/'

SITE_ID = 1

TEMPLATES = [
    {
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [os.path.join(BASE_DIR, 'mainapp', 'templates')],
    'OPTIONS': {
        'context_processors': [
            'django.contrib.auth.context_processors.auth',
            'django.contrib.messages.context_processors.messages',
            'django.template.context_processors.i18n',
            'django.template.context_processors.debug',
            'django.template.context_processors.request',
            'django.template.context_processors.media',
            'django.template.context_processors.csrf',
            'django.template.context_processors.tz',
            'sekizai.context_processors.sekizai',
            'django.template.context_processors.static',
            'cms.context_processors.cms_settings'
        ],
        'loaders': [
            'django.template.loaders.filesystem.Loader',
            'django.template.loaders.app_directories.Loader',
            'django.template.loaders.eggs.Loader'
        ]
        }
    }
]


MIDDLEWARE_CLASSES = (
    'cms.middleware.utils.ApphookReloadMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.sites.middleware.CurrentSiteMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'cms.middleware.user.CurrentUserMiddleware',
    'cms.middleware.page.CurrentPageMiddleware',
    'cms.middleware.toolbar.ToolbarMiddleware',
    'cms.middleware.language.LanguageCookieMiddleware'
)

INSTALLED_APPS = (
    'djangocms_admin_style',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.admin',
    'django.contrib.sites',
    'django.contrib.sitemaps',
    'django.contrib.staticfiles',
    'django.contrib.messages',
    'cms',
    'menus',
    'sekizai',
    'treebeard',
    'djangocms_text_ckeditor',
    'aldryn_bootstrap3',
    'aldryn_style',
    'filer',
    'easy_thumbnails',
    'djangocms_flash',
    'djangocms_googlemap',
    'djangocms_inherit',
    'djangocms_link',
    'mainapp',
    'storages',
    'widget_tweaks',
    'post_office',
    'smuggler',
    'cmsplugin_filer_image',
    'aldryn_apphooks_config',
    'parler',
    'taggit',
    'taggit_autosuggest',
    'meta',
    'djangocms_blog'
)

META_SITE_PROTOCOL = 'http'
META_USE_SITES = True

LANGUAGES = (
    ('nb', gettext('nb')),
)

CMS_LANGUAGES = {
    'default': {
        'public': True,
        'hide_untranslated': False,
        'redirect_on_fallback': True,
    },
    1: [
        {
            'public': True,
            'code': 'nb',
            'hide_untranslated': False,
            'name': gettext('nb'),
            'redirect_on_fallback': True,
        },
    ],
}
PARLER_LANGUAGES = {
    'default': {
        'fallbacks': ['nb']
    },
    1: (
        {'code': 'nb'},
    )
}
CMS_TEMPLATES = (
    ('page.html', 'Page'),
    ('blog.html', 'Blog Page'),
    ('feature.html', 'Page with Feature'),
    ('test.html', 'Test app page'),
    ('react.html', 'React page')
)

CMS_PERMISSION = True

CMS_PLACEHOLDER_CONF = {}


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(DATA_DIR, 'django.db'),
    }
}

THUMBNAIL_PROCESSORS = (
    'easy_thumbnails.processors.colorspace',
    'easy_thumbnails.processors.autocrop',
    'filer.thumbnail_processors.scale_and_crop_with_subject_location',
    'easy_thumbnails.processors.filters'
)


ALDRYN_STYLE_CLASS_NAMES = (
    ('container', _('container')),
    ('content', _('content')),
    ('teaser', _('teaser')),
    ('page', _('page')),
    ('page bilder', _('bilder'))
)

try:
    from .local_settings import *
except:
    pass
