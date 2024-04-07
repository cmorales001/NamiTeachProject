import googleapiclient.discovery
import spacy

# Cargar el modelo de lenguaje de spaCy
nlp = spacy.load("en_core_web_sm")

def verificar_contenido_educativo(video_title, video_description, basic_knowldge):
    # Lista de palabras clave relacionadas con la educación
    palabras_clave_educativas = ["educativo", "aprendizaje", "matemáticas", "didáctico", "niños"
                                 , "escolar", "escuela", "primaria", "estudiantes", "grado", "academico", basic_knowldge]

    # Tokenizar y procesar el título y la descripción del video
    tokens_title = nlp(video_title.lower())
    tokens_description = nlp(video_description.lower())

    # Verificar si alguna palabra clave está presente en el título o la descripción
    if any(keyword in tokens_title.text or keyword in tokens_description.text for keyword in palabras_clave_educativas):
        return True
    else:
        return False


def search_youtube_api(basic_knowldge,level, num_results=6):
    try:
        api_key = 'AIzaSyC09MRZw13SNAi6RGDloXw5WtZmIP2iFcA'
        youtube = googleapiclient.discovery.build('youtube', 'v3', developerKey=api_key)

        request = youtube.search().list(
            q=f"Explicación de {basic_knowldge} para niños de {str(level)} grado de primaria" ,
            part='snippet',  # Agrega este parámetro con el valor 'snippet'
            type='video',
            maxResults=num_results,
            videoDuration='medium', 
        )

        response = request.execute()
        
        links = []
        for item in response.get('items', []):
            video_id = item['id']['videoId']
            video_url = f'https://www.youtube.com/watch?v={video_id}'
            #extraemos su título y descripcion
            video_title = item['snippet']['title']
            video_description = item['snippet']['description']
            # Verificar si el video es educativo antes de agregarlo a la lista de links
            if verificar_contenido_educativo(video_title, video_description,basic_knowldge ):
                links.append(video_url) 

        return links
    except Exception as e:
        return {"message": f"Error: {str(e)}"} 
        
