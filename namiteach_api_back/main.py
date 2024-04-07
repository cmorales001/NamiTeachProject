from fastapi import FastAPI, File, UploadFile
from scanner.Scanner import extract_text_of_image
from pydantic import BaseModel
from predictions import predictions_model, youtube
from predictions import suggestion_yt_mongo
from fastapi import HTTPException

app =FastAPI()

MONGO_URI = "mongodb://localhost:27017"
DATABASE_NAME = "namiteach_db"

class Problem(BaseModel):
    instruction: str
    level: int
    
class OpinionContent(BaseModel):
    basicKnowlegde:str
    videoUrl: str
    feedback: str


# Conexión a MongoDB - esta función se ejecutará al iniciar la aplicación
@app.on_event("startup")
async def startup_db_client():
    app.mongodb = suggestion_yt_mongo.connect_to_mongo()
    await suggestion_yt_mongo.create_unique_index()

# Cierre de la conexión a MongoDB - esta función se ejecutará al detener la aplicación
@app.on_event("shutdown")
async def shutdown_db_client():
    suggestion_yt_mongo.close_mongo_connection()



@app.post("/convert/text")
async def get_text_of_image(image: UploadFile = File(...)):
    try:
        resultado = extract_text_of_image(image.file)
        return {"message": resultado}
    except Exception as e:
        print(f"Error en el endpoint: {str(e)}")
        return {"message": "Error en el endpoint"}
    finally:
        print()


@app.post("/basicknowledge")
async def get_basic_content(problem: Problem):
    try:
        basic_knowledge = predictions_model.predict(problem.instruction, problem.level)
        if basic_knowledge == -1:
            raise Exception()
        
        # Obtener videos desde la API de YouTube
        videos_from_youtube = youtube.search_youtube_api(basic_knowledge, problem.level)
        supervised_videos= await suggestion_yt_mongo.suggested_videos(videos_from_youtube, basic_knowledge)
        return {"content": supervised_videos, "basicKnowledge": basic_knowledge}
    except Exception as e:
        print(f"Error en el endpoint: {str(e)}")
        raise Exception("Pregunta de Grado Superior") 
       
        
@app.post("/content/opinion")
async def content_opinion(opinion_content: OpinionContent):
    basic_knowledge = opinion_content.basicKnowlegde
    new_link=opinion_content.videoUrl
    opinion=opinion_content.feedback
    try:
        result = await suggestion_yt_mongo.save_opinion(basic_knowledge, new_link, opinion)
        return result
    except Exception as e:
        return {"message": f"Error en el endpoint: {str(e)}"} 
    