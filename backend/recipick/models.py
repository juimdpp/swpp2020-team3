from django.db import models
from django.db.models import Model
from django.contrib.auth.models import User
# Create your models here.

class Ingredient(models.Model):
    name = models.CharField(max_length=64)
    quantity = models.FloatField()
    price = models.IntegerField()
    price_normalized = models.IntegerField(null=True) # 좀 더 엄밀한 나눗셈 필요
    igd_type = models.CharField(max_length=5) # 단위: 개 / g
    brand = models.CharField(max_length=64)
    picture = models.ImageField(null=True)

class ImageModel(models.Model):
    img = models.ImageField()

class Recipe(models.Model):
    title = models.CharField(max_length=64)
    author = models.ForeignKey(
        User,
        on_delete = models.SET_NULL,
        null = True,
    )
    price = models.IntegerField()
    duration= models.IntegerField(default='0')
    thumbnail = models.ImageField(null=True)
    # This should be foreign key for the one to many field. However, when we use foreign key, we can't implement list. How to handle this?
    photo_list = models.ManyToManyField(
        ImageModel,
    )
    description_list = models.JSONField(null=True)
    tag_list = models.JSONField(null=True)
    ingredient_list = models.ManyToManyField(
        Ingredient,
    )
    category = models.TextField(null=True)
    rating = models.FloatField(null=True)
    likes = models.IntegerField(null=True)
    created_date = models.DateField(null=True)
    edited = models.BooleanField(null=True)    
    summary = models.TextField(null=True)

class Comment(models.Model):
    recipe = models.ForeignKey(
        Recipe,
        on_delete = models.SET_NULL,
        null = True,
    )
    content = models.TextField()
    author = models.ForeignKey(
        User,
        on_delete = models.SET_NULL,
        null = True,
    )
    created_date = models.DateField()
    edited = models.BooleanField()

class Reply(models.Model):
    comment = models.ForeignKey(
        Comment,
        on_delete = models.SET_NULL,
        null = True,
    )
    content = models.TextField()
    author = models.ForeignKey(
        User,
        on_delete = models.SET_NULL,
        null = True,
    )
    created_date = models.DateField()
    edited = models.BooleanField()


