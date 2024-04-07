import os
from PIL import Image
from pytesseract import image_to_string
from pytesseract import *
import cv2
import numpy as np
import re


def extract_text_of_image(img_path):

    # Ruta al ejecutable de Tesseract OCR
    #pytesseract.tesseract_cmd = r'C:\Users\KrauserPC\Documents\8vo Semestre\Mineria de Datos\Proyecto\tesseract\tesseract.exe'
    pytesseract.tesseract_cmd = os.path.abspath("scanner/tesseract/tesseract.exe")
    # Cargar la imagen
    img = Image.open(img_path)

    # Convertir la imagen a formato HSV
    img_array = np.array(img)
    hsv_img = cv2.cvtColor(img_array, cv2.COLOR_BGR2HSV)

    # Extraer el canal de valor (V)
    value_channel = hsv_img[:, :, 2]

    # Aplicar un desenfoque gaussiano para reducir el ruido
    blur_img = cv2.GaussianBlur(value_channel, (1, 1), 0)

    # Aplicar umbralización para obtener una imagen binaria
    thresh_img = cv2.threshold(blur_img, 0, 5000, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]
    
        # Detección de contornos
    contours, hierarchy = cv2.findContours(thresh_img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Encontrar contornos de grupos de párrafos
    paragraph_contours = []
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        aspect_ratio = w / float(h)
        if aspect_ratio > 0.5 and aspect_ratio < 10:  # Filtrar contornos con aspecto de párrafo
            paragraph_contours.append(contour)

    # Dibujar contornos de grupos de párrafos en la imagen original
    cv2.drawContours(img_array, paragraph_contours, -1, (0, 255, 0), 2)

    # Utilizar pytesseract para extraer texto de la imagen preprocesada
    text = image_to_string(Image.fromarray(thresh_img), lang='spa')

    text_clean= re.sub(r'\s+', ' ', text)


    return text_clean

