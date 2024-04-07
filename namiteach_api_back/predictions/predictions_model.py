import os
import tensorflow as tf
from transformers import BertTokenizer, TFBertModel
from tensorflow.keras import layers
import numpy as np
import pandas as pd
from transformers import BertTokenizer

PRE_TRAINED_MODEL_NAME ='dccuchile/bert-base-spanish-wwm-cased'
#Modelo con el que fue entrenado
class BERTQuestionsClassifier(tf.keras.Model):
    def __init__(self, n_classes, hidden_units=512, dropout_rate=0.3):
        super(BERTQuestionsClassifier, self).__init__()
        self.bert = TFBertModel.from_pretrained(PRE_TRAINED_MODEL_NAME)
        self.dropout1 = layers.Dropout(dropout_rate)
        self.hidden_layer = layers.Dense(hidden_units, activation='relu')
        self.dropout2 = layers.Dropout(dropout_rate)
        self.hidden_layer2 = layers.Dense(hidden_units//2, activation='relu')  
        self.dropout3 = layers.Dropout(dropout_rate)
        self.hidden_layer3 = layers.Dense(hidden_units//2, activation='relu')  
        self.dropout4 = layers.Dropout(dropout_rate)
        self.linear = layers.Dense(n_classes, activation='softmax')

    def call(self, inputs):
        input_ids = inputs['input_ids']
        attention_mask = inputs['attention_mask']

        outputs = self.bert(input_ids, attention_mask=attention_mask)
        pooler_output = outputs.pooler_output

        # Aplicar dropout y capas ocultas adicionales
        drop_output1 = self.dropout1(pooler_output)
        hidden_output = self.hidden_layer(drop_output1)
        drop_output2 = self.dropout2(hidden_output)

        # Nuevas capas ocultas
        hidden_output2 = self.hidden_layer2(drop_output2)
        drop_output3 = self.dropout3(hidden_output2)
        hidden_output3 = self.hidden_layer3(drop_output3)
        drop_output4 = self.dropout4(hidden_output3)

        # Capa de salida lineal
        output = self.linear(drop_output4)

        return output
    

def tokenizador(question, max_len=500):
    
    tokenizer = BertTokenizer.from_pretrained(PRE_TRAINED_MODEL_NAME)
    # Tokeniza la pregunta
    encoding = tokenizer(
        [question],
        max_length=max_len,
        truncation=True,
        padding='max_length',
        return_tensors='tf'
    )

    return encoding
     


def change_number_to_label(number, level):
        df_labels=pd.read_excel(os.path.abspath(f'topics/labels_{level}.xlsx'))
        for index, row in df_labels.iterrows():
            if str(row['id']) == str(number):
                return row['label']


def predict(question, level):
    #colocamos los umbrales optimos
    umbrales={4:0, 5:0.06, 6: 0.06, 7: 0.08}
    # Construir la ruta al modelo según el nivel proporcionado
    model_path = os.path.abspath(f'models/{level}/')
    
    # Carga el modelo especificando las capas personalizadas
    loaded_model = tf.keras.models.load_model(model_path, custom_objects={'BERTQuestionsClassifier': BERTQuestionsClassifier}, compile=False)
    # Tokenizar el texto usando el tokenizador cargado
    encoding = tokenizador(question)
    # Realiza la predicción con el modelo
    predicciones = loaded_model.predict({
        'input_ids': encoding['input_ids'],
        'attention_mask': encoding['attention_mask']
    })
    # Aplica softmax para obtener probabilidades
    probabilidades = tf.nn.softmax(predicciones, axis=-1)
    # Obtiene la etiqueta predicha como el índice de la clase con mayor probabilidad
    etiqueta_predicha = tf.argmax(probabilidades, axis=-1).numpy()[0]
    
     # Aplica el umbral en función del nivel de pregunta
    if probabilidades.numpy().max() < umbrales[level]:
        return -1  # si no pertenece a ninguna clase
    else:
        return change_number_to_label(etiqueta_predicha,level)







