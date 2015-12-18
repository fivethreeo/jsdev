# -*- coding: utf-8 -*-

from django import forms
from django.forms.models import ModelForm
from testproject.models import Deltager

from dateutil.relativedelta import *
from dateutil.rrule import *
from dateutil.parser import *
from datetime import *

class DeltagerForm(ModelForm):
    
    vilkaar = forms.BooleanField(widget=forms.CheckboxInput(),
        label='Jeg har lest og godtatt vilkårene.', required=False)
        
    def __init__(self, *args, **kwargs):
        kwargs.setdefault('initial', {})
        kwargs['initial']['dato'] = rrule(WEEKLY,byweekday=FR)[0]
        super(DeltagerForm, self).__init__(*args, **kwargs)

    class Meta:
        model = Deltager
        fields = ['fornavn','etternavn','adresse','postnummer','poststed','epost','telefonnummer','dato','annet','vilkaar']
        widgets = {
            'annet': forms.Textarea(attrs={'rows':5, 'cols':25})
        }          

    def clean_dato(self):
        """
        Validerer fredag
        """
        d = self.cleaned_data.get('dato')
        if d.weekday() == 4:
            return d
        raise forms.ValidationError('Bare fredager kan velges.')
        
    def clean_vilkaar(self):
        """
        Validerer at brukeren har godtatt vilkårene.
        """
        if self.cleaned_data.get('vilkaar', False):
            return self.cleaned_data['vilkaar']
        raise forms.ValidationError('Du må godta vilkårene for å sende bestillingen.')
