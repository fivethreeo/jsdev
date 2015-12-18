# -*- coding: utf-8 -*-
from django.db import models

class Deltager(models.Model):
    fornavn = models.CharField(max_length=25)
    etternavn = models.CharField(max_length=25)
    adresse = models.CharField(max_length=255)
    postnummer = models.CharField(max_length=4)
    poststed = models.CharField(max_length=30)
    epost = models.EmailField(max_length=75)
    telefonnummer = models.CharField(max_length=20)
    
    dato = models.DateField()
    annet = models.TextField(blank=True)
    
            
    def __unicode__(self):
        return u'%s %s' % (self.fornavn, self.etternavn)
