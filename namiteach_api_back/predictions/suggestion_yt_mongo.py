from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import FastAPI



from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = "mongodb://localhost:27017"
DATABASE_NAME = "namiteach_db"
COLLECTION_NAME = "suggestions_yt"

client = AsyncIOMotorClient(MONGO_URI)
db = client[DATABASE_NAME]

def connect_to_mongo():
    return db

def close_mongo_connection():
    client.close()
    
async def get_videos_by_basic_knowledge(basic_knowledge):
    collection = db[COLLECTION_NAME]
    cursor = collection.find({"basic_knowledge": basic_knowledge})
    videos = await cursor.to_list(length=None)
    return videos    

async def get_document_by_basic_knowledge(basic_knowledge):
    collection = db[COLLECTION_NAME]
    document = await collection.find_one({"basic_knowledge": basic_knowledge})
    return document

async def insert_document(document):
    collection = db[COLLECTION_NAME]
    result = await collection.insert_one(document)
    return result.inserted_id

async def create_unique_index():
    collection = db[COLLECTION_NAME]
    await collection.create_index("basic_knowledge", unique=True)

async def save_opinion(basic_knowledge, new_link, opinion):
    like = 1 if opinion == "like" else 0
    dislike = 1 if opinion == "dislike" else 0
    existing_document = await get_document_by_basic_knowledge(basic_knowledge)

    if existing_document:
        link_existente = any(item["link"] == new_link for item in existing_document["content"])
        
        if not link_existente:
            existing_document["content"].append({"link": new_link, "like": like, "dislike": dislike})
        else:
            for item in existing_document["content"]:
                if item["link"] == new_link:
                    if opinion == "like":
                        item["like"] += 1 
                    else:     
                        item["dislike"] += 1  
                    break

        await db[COLLECTION_NAME].update_one({"basic_knowledge": basic_knowledge}, {"$set": existing_document})
        return {"message": "Documento actualizado correctamente"}
    else:
        like = 1 if opinion == "like" else 0
        dislike = 1 if opinion == "dislike" else 0
        
        documento_a_insertar = {
            "basic_knowledge": basic_knowledge,
            "content": [{"link": new_link, "like": like, "dislike": dislike}]
        }

        await insert_document(documento_a_insertar)
        return {"message": "Documento insertado correctamente"}

async def suggested_videos(videos_from_youtube, basic_knowledge):
        num_videos=2
        # Obtener videos desde MongoDB para el basic_knowledge dado
        basic_knowledge_db = await get_document_by_basic_knowledge(basic_knowledge)
        #si no existen registros solo se devuelve el contenido de youtube
        if(not basic_knowledge_db):
            return videos_from_youtube[:num_videos]
        # se obtiene los videos registrados y sus opiniones
        videos_from_mongo=basic_knowledge_db["content"]
        # se crea la nueva respuesta con sugerencias
        suggested_videos = []
        #aqui almaceno los videos con mala clasificación para descartarlos posteriormente
        bad_videos=[]
        
        # ordeno los videos existentes por likes
        videos_from_mongo.sort(key=lambda x: x["like"], reverse=True)

        # analizo los videos alamacenados para categorizarlos
        for video in videos_from_mongo:
            #si tienen menos de 20 reactiones se agregan a la respuesta para ser evaluados
            reactions= video["like"] + video["dislike"] 
            if reactions <20:
                suggested_videos.append(video["link"])
            else:
                # si superan las 20 reacciones, compara sus |reacciones para determinar si es bueno o malo
                if video["like"]>video["dislike"]:
                    suggested_videos.append(video["link"])
                else:
                    bad_videos.append(video["link"])
            
        # si ya tienen un longitud de 3 son enviados directamente, si no se obtienen más videos de yt
        if(len(suggested_videos)>2):
            return suggested_videos[:num_videos]
        
        #elimino los videos que llegan desde yt y que ya están en el array de videos sugeridos
        for good_video in suggested_videos:
            for video_youtube in videos_from_youtube:
                if video_youtube==good_video:
                    videos_from_youtube.remove(video_youtube)
                    
        #elimino los videos que se etiquetaron como malos           
        if(len(bad_videos)>0):
            for bad_video in bad_videos:
                for video_youtube in videos_from_youtube:
                    if video_youtube==bad_video:
                        videos_from_youtube.remove(video_youtube)
                        
        suggested_videos.extend(videos_from_youtube)
        
        return suggested_videos[:num_videos]