from django.http import HttpResponse, HttpResponseNotAllowed, JsonResponse
from django.contrib.auth.models import User
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.csrf import csrf_exempt
from recipick.models import Ingredient, Comment, Recipe, Reply, ImageModel
from django.contrib import auth
import json
from json import JSONDecodeError
import datetime
import base64
from django.core.files.base import ContentFile
from random import *
import random

def getuser(request, id):
    if(request.method) == 'GET':
        user = [user for user in User.objects.filter(id = id).values()]
        return JsonResponse(user, safe=False, status=200)

def signup(request):
    if request.method == 'POST':
        req_data = json.loads(request.body.decode())
        username = req_data['username']
        password = req_data['password']
        user = User.objects.create_user(username = username, password = password)
        user.save()
        return HttpResponse(status=201)
    else:
        return HttpResponseNotAllowed(['POST'])

def signin(request):
    if request.method == 'POST':
        req_data = json.loads(request.body.decode())
        username = req_data['username']
        password = req_data['password']
        user = auth.authenticate(request, username = username, password = password)
        if user is not None:
            auth.login(request, user)
            return HttpResponse(status=204)
        else:
            return HttpResponse(status=401)
    else:
        return HttpResponseNotAllowed(['POST'])

def signout(request):
    if request.method == 'GET':
        auth.logout(request)
        return HttpResponse(status=204)
    else:
        return HttpResponseNotAllowed(['GET'])

def ingredient_post(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.POST['json'])
            name = body["name"]
            quantity = body['quantity']
            price = body['price']
            igd_type = body['igd_type']
            brand = body['brand']
            picture = request.FILES['file']
        except:
            return HttpResponse(status = 400)
        igd = Ingredient(name = name, quantity = quantity, price = price, price_normalized = int(price)/int(quantity),
        igd_type = igd_type, brand = brand, picture = picture)
        igd.save()
        response = {'id': igd.id, 'name': igd.name, 'quantity':igd.quantity, 'price':igd.price, 'igd_type':igd.igd_type, 'brand':igd.brand}
        return JsonResponse(response, safe=False, status=200)
    else:
        return HttpResponseNotAllowed(['POST'])
        
def ingredient(request, id):
    if request.method == 'GET':
        ingredient = [igd for igd in Ingredient.objects.filter(id = id).values()]
        return JsonResponse(ingredient, safe=False, status=200)
    elif request.method == 'DELETE':
        try:
            igd = Ingredient.objects.get(id = id)
        except:
            return HttpResponse(status = 404)
        igd.delete()
        return HttpResponse(status=200)
    else:
        return HttpResponseNotAllowed(['GET','DELETE'])

def ingredient_list(request):
    if request.method == 'GET':
        ingredient_list = Ingredient.objects.all().values()
        ingredientList = []
        for ing in ingredient_list:
            ingredientList.append({'name': ing['name'], 'quantity': ing['quantity'], 
                    'price': ing['price'], 'igd_type': ing['igd_type'], 'brand': ing['brand']})
        return JsonResponse(ingredientList, safe=False)
    else:
        return HttpResponseNotAllowed(['GET'])
    

def recipe_page(request):
    if request.method == 'GET':
        minCost = int(request.GET.get('minCost'))
        maxCost = int(request.GET.get('maxCost'))
        minTime = int(request.GET.get('minTime'))
        maxTime = int(request.GET.get('maxTime'))
        pageStart = int(request.GET.get('pageStart'))
        searchMode = request.GET.get('searchMode')
        categories = []
        if request.GET.get('category1') == 'true':
            categories.append('1') # category name?
        if request.GET.get('category2') == 'true':
            categories.append('2')
        if request.GET.get('category3') == 'true':
            categories.append('3')
        if request.GET.get('category4') == 'true':
            categories.append('4')
        if request.GET.get('category5') == 'true':
            categories.append('5')
        if request.GET.get('category6') == 'true':
            categories.append('6')
        recipelist = Recipe.objects.filter(price__gte = minCost, price__lte = maxCost, duration__gte = minTime, duration__lte = maxTime, category__in = categories)
        if searchMode == 'uploaded-date':
            recipepage = recipelist.order_by('-created_date')[10*pageStart:(10*pageStart+51)].values(
                'id', 'title', 'author', 'summary', 'likes', 'rating', 'price', 'duration', 'thumbnail')
        elif searchMode == 'likes':
            recipepage = recipelist.order_by('-likes')[10*pageStart:(10*pageStart+51)].values(
                'id', 'title', 'author', 'summary', 'likes', 'rating', 'price', 'duration', 'thumbnail')
        elif searchMode == 'cost':
            recipepage = recipelist.order_by('-cost')[10*pageStart:(10*pageStart+51)].values(
                'id', 'title', 'author', 'summary', 'likes', 'rating', 'price', 'duration', 'thumbnail')
        elif searchMode == 'rating':
            recipepage = recipelist.order_by('-rating')[10*pageStart:(10*pageStart+51)].values(
                'id', 'title', 'author', 'summary', 'likes', 'rating', 'price', 'duration', 'thumbnail')
        else: # searchMode == 'relevance'
            vector = SearchVector('title')
            query = SearchQuery(searchWord)
            recipepage = recipelist.annotate(rank=SearchRank(vectory,query)).order_by('-rank').values(
                'id', 'title', 'author', 'summary', 'likes', 'rating', 'price', 'duration', 'thumbnail')
        return JsonResponse([recipe for recipe in recipepage], safe=False, status=200)
    else:
        return HttpResponseNotAllowed(['GET'])
    
def image(request):
    if request.method == 'GET':
        try: # if bad request --> 400
            imgList = ImageModel.objects.all().values()
            print(imgList)
        except:
            return HttpResponse(status = 400)
        return HttpResponse(status = 200)
    else:
        return HttpResponseNotAllowed(['GET'])


    #if request.method == 'GET':
    #    recipelist=[]
    #    if Recipe.objects.all().count() < 10*id:
    #        recipelist = []
    #    else:
    #        recipelist = [recipe for recipe in Recipe.objects.all()[10*id:(10*id+51)].values()]
    #    return JsonResponse(recipelist, safe=False, status=200)
    #else:
    #    return HttpResponseNotAllowed(['GET'])

def recipe_post(request):
    if request.method == 'POST': # only allowed method, else --> 405
        user = request.user
        if not user.is_authenticated: # not authenticated --> 401
            return HttpResponse(status=401)
        try: # bad request (decode error) --> 400
            body = json.loads(request.body.decode())
            title = body['title']
            price = body['price']   # normally should convert to int
            duration = body['duration']  # normally should convert to float
            d_list = body['descriptionList']
            t_list = body['tagList']
            i_list = body['imageList']  
            p_list = body['prevList']   # right now works with prev. Maybe there is a better method?
            ##@@## these will be implemented later ##@@##
            #summary = body['summary']
            #likes = int(body['likes'])
            #edited = bool(body['edited'])
            #d = body['date']
        except (KeyError, JSONDecodeError) as e:
            return HttpResponse(status = 400)

        # date = datetime.datetime.strptime(d, "%Y-%m-%d").date()
        recipe = Recipe(user=user, title=title, price=price, duration=duration, description_list=d_list, tag_list=t_list)
        recipe.save()

        cnt = 0;
        for img_64 in p_list:
            format, imgstr = img_64.split(';base64,')
            ext = format.split('/')[-1]
            data = ContentFile(base64.b64decode(imgstr), name='temp.' + ext)
            new_img = ImageModel.objects.create(img=data, description_index=cnt)
            recipe.photo_list.add(new_img)
            cnt = cnt + 1
        
        recipe.save()


# I don't know if we can use request.FILES.getlist(). Study and ask 조교님.
        # c = 0
        # img_idx = body['img_idx_list']
        # for f in request.FILES.getlist('file'):
        #     i = ImageModel(img = f, desc_index = img_idx[c])
        #     i.save()
        #     recipe.photo_list.add(i)
        #     c = c+1
        # num=0
        # for i in body['ingredients']:
        #     igd = Ingredient(name = i['name'], quantity = i['quantity'], price = i['price'], price_normalized = int(i['price'])/int(i['quantity']),
        #     igd_type = i['igd_type'], brand = i['brand'], picture=igd_file[num])
        #     igd.save()
        #     recipe.ingredient_list.add(igd)
        #     num = num + 1
        return HttpResponse(status = 201)
    else:
        return HttpResponseNotAllowed(['POST'])

def randomrecipe(request):
     if request.method == 'GET':
        print('check')
        cnt = Recipe.objects.all().count()
        if cnt <= 4:
            recipes = [recipes for recipes in Recipe.objects.all()]
            newrecipes = []
            for recipe in recipes:
                p_list = recipe.photo_list
                new_list = []
                for photo in p_list.all():
                    encoded_string = base64.b64encode(photo.img.read())
                    new_list.append(encoded_string.decode('utf-8'))
                newrecipe = {'id': recipe.id, 'title': recipe.title, 'photo_list': new_list}
                newrecipes.append(newrecipe)
            return JsonResponse(newrecipes, safe=False)
        else :
            recipes = [recipes for recipes in Recipe.objects.all()]
            s = random.sample(range(1,cnt), 4)
            newrecipes = []
            for n in s:
                recipe = recipes[n]
                p_list = recipe.photo_list
                new_list = []
                for photo in p_list.all():
                    encoded_string = base64.b64encode(photo.img.read())
                    new_list.append(encoded_string.decode('utf-8'))
                newrecipe = {'id': recipe.id, 'title': recipe.title, 'photo_list': new_list}
                newrecipes.append(newrecipe)
            return JsonResponse(newrecipes, safe=False)

def recipe(request, id):
    if request.method == 'GET':
        recipe = Recipe.objects.get(id = id)
        p_list = recipe.photo_list
        new_list = []
        for photo in p_list.all():
            encoded_string = base64.b64encode(photo.img.read())
            new_list.append(encoded_string.decode('utf-8'))
        igd = recipe.ingredient_list
        newigdlist = []
        for item in igd.all():
            newitem = {
                'name':item.name,
                'quantity': item.quantity,
                'price': item.price,
                'price_normalized': item.price_normalized,
                'igd_type': item.igd_type,
                'brand': item.brand,
            }
            newigdphoto = base64.b64encode(item.picture.read())
            newitem['picture'] = newigdphoto.decode('utf-8')
            newigdlist.append(newitem)
        newrecipe = {
            'title': recipe.title,
            'price': recipe.price,
            'duration': recipe.duration,
            'photo_list': new_list,
            'description_list': recipe.description_list,
            'tag_list': recipe.tag_list,
            'ingredient_list': newigdlist,
            'category': recipe.category,
            'rating': recipe.rating,
            'likes': recipe.likes,
            'created_date': recipe.created_date,
            'edited': recipe.edited,
            'summary': recipe.summary,
        }
        return JsonResponse(newrecipe, safe=False)
    elif request.method == 'DELETE':
        try:
            recipe = Recipe.objects.get(id = id)
        except:
            return HttpResponse(status = 404)
        comments = Comment.objects.all()
        replies = Reply.objects.all()
        for comment in comments:
            if comment.recipe == recipe:
                for reply in replies:
                    if reply.comment == comment:
                        reply.delete()
                comment.delete()
        recipe.delete()
        return HttpResponse(status = 200)
    else:
        return HttpResponseNotAllowed(['GET','PUT','DELETE'])

def recipe_comment(request, id):
    if request.method == 'GET':
        recipe = Recipe.objects.get(id= id)
        comment = [comment for comment in Comment.objects.filter(recipe = recipe).values()]
        return JsonResponse(comment, safe=False, status=200)
    elif request.method == 'POST':
        req_data = json.loads(request.body.decode())
        content = req_data['content']
        edited = req_data['edited']
        d = req_data['date']
        date = datetime.datetime.strptime(d, "%Y-%m-%d").date()
        author = request.user
        recipe = Recipe.objects.get(id= id)
        comment = Comment(recipe = recipe, content = content, author = author, edited = edited, created_date = date)
        comment.save()
        response_dict = {'id': comment.id, 'content': comment.content, 'author_id': comment.author_id, 'recipe_id': comment.recipe_id, 'edited': comment.edited, 'created_date': comment.created_date}
        return JsonResponse(response_dict, status=201, safe = False)
    else: 
        return HttpResponseNotAllowed(['GET', 'POST'])

def comment(request, id):
    if request.method == 'GET':
        comment = [comment for comment in Comment.objects.filter(id= id).values()]
        return JsonResponse(comment, safe=False, status=200)
    elif request.method == 'PUT':
        body = request.body.decode()
        content = json.loads(body)['content']
        edited = json.loads(body)['edited']
        comment = Comment.objects.filter(id= id)
        if not comment:
            return HttpResponse(status = 404)
        comment = comment[0]
        comment.content = content
        comment.edited = edited
        comment.save()
        response_dict = {'id': comment.id, 'content': comment.content, 'author_id': comment.author_id, 'recipe_id': comment.recipe_id, 'edited': comment.edited}
        return JsonResponse(response_dict, status=200, safe = False) 
    elif request.method == 'DELETE':
        try:
            comment = Comment.objects.get(id = id)
        except:
            return HttpResponse(status = 404)
        replies = Reply.objects.all()
        for reply in replies:
            if reply.comment == comment:
                reply.delete()
        comment.delete()
        return HttpResponse(status=200)
    else:
        return HttpResponseNotAllowed(['GET', 'PUT', 'DELETE'])

def comment_reply(request, id):
    if request.method == 'GET':
        comment = Comment.objects.get(id= id)
        reply = [reply for reply in Reply.objects.filter(comment = comment).values()]
        return JsonResponse(reply, safe=False, status=200)
    elif request.method == 'POST':
        req_data = json.loads(request.body.decode())
        content = req_data['content']
        edited = req_data['edited']
        d = req_data['date']
        date = datetime.datetime.strptime(d, "%Y-%m-%d").date()
        author = request.user
        comment = Comment.objects.get(id= id)
        reply = Reply(comment = comment, content = content, author = author, edited = edited, created_date = date)
        reply.save()
        response_dict = {'id': reply.id, 'content': reply.content, 'author_id': reply.author_id, 'comment_id': reply.comment_id, 'edited': reply.edited, 'created_date': reply.created_date}
        return JsonResponse(response_dict, status=201, safe = False)
    else: 
        return HttpResponseNotAllowed(['GET', 'POST'])

def reply(request, id):
    if request.method == 'GET':
        reply = [reply for reply in Reply.objects.filter(id= id).values()]
        return JsonResponse(reply, safe=False, status=200)
    elif request.method == 'PUT':
        body = request.body.decode()
        content = json.loads(body)['content']
        edited = json.loads(body)['edited']
        reply = Reply.objects.filter(id= id)
        if not reply:
            return HttpResponse(status = 404)
        reply = reply[0]
        reply.content = content
        reply.edited = edited
        reply.save()
        response_dict = {'id': reply.id, 'content': reply.content, 'author_id': reply.author_id, 'comment_id': reply.comment_id, 'edited': reply.edited}
        return JsonResponse(response_dict, status=200, safe = False) 
    elif request.method == 'DELETE':
        try:
            reply = Reply.objects.get(id = id)
        except:
            return HttpResponse(status = 404)
        reply.delete()
        return HttpResponse(status=200)
    else:
        return HttpResponseNotAllowed(['GET', 'PUT', 'DELETE'])



@ensure_csrf_cookie
def token(request):
    if request.method == 'GET':
        return HttpResponse(status=204)
    else:
        return HttpResponseNotAllowed(['GET'])

from .models import Ingredient, Comment, Recipe, Reply