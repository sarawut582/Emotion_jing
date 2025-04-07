import cv2
from deepface import DeepFace
import json
from datetime import datetime
from collections import Counter
import requests
import time

cap = cv2.VideoCapture(0)

# ตรวจสอบการเปิดกล้อง
if not cap.isOpened():
    print("ไม่สามารถเปิดกล้องได้")
    exit()

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

classroom_id = "05-0404"
session_id = "002"

last_sent_time = 0
interval = 3  # ส่งทุก 3 วินาที

while True:
    ret, frame = cap.read()
    if not ret:
        print("ไม่สามารถจับภาพได้จากกล้อง")
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    for (x, y, w, h) in faces:
        cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)

    student_count = len(faces)
    cv2.imshow("Frame", frame)

    current_time = time.time()
    if current_time - last_sent_time >= interval:
        last_sent_time = current_time

        dominant_emotions_all = []
        for (x, y, w, h) in faces:
            face_img = frame[y:y + h, x:x + w]
            try:
                result = DeepFace.analyze(face_img, actions=['emotion'], enforce_detection=False)
                if isinstance(result, list) and len(result) > 0:
                    dominant_emotions_all.append(result[0]['dominant_emotion'])
            except Exception as e:
                print(f"Error analyzing face: {e}")

        emotion_counter = Counter(dominant_emotions_all)
        timestamp = datetime.now()

        # แก้ไขข้อความเพื่อไม่ให้ใช้ Unicode ที่ไม่รองรับ
        print(f"Emotions: {dict(emotion_counter)}")  # แสดงอารมณ์ที่ตรวจพบ

        # ส่งข้อมูลทั้งหมดครั้งเดียวแบบรวม
        try:
            payload = {
                "emotions": dict(emotion_counter),
                "time": timestamp.isoformat()
            }
            response = requests.post("http://localhost:3000/api/emotions", json=payload)
            if response.status_code == 200:
                print("Success: Data sent successfully")  # ใช้ข้อความธรรมดาแทนอีโมจิ
            else:
                print(f"Error: Failed to send data. Status Code: {response.status_code}")
        except Exception as e:
            print(f"Error: {e}")  # แสดงข้อผิดพลาดโดยไม่ใช้ Unicode

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
