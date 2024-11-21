# Python 이미지를 기반으로 설정
FROM python:3.11-slim

# 2. 시스템 패키지 업데이트 및 필요한 패키지 설치
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# 작업 디렉토리 설정
WORKDIR /app

# 필요한 패키지 설치
COPY ./requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt
ENV PYTHONUNBUFFERED=1

# 소스 코드 복사
COPY . .

# 포트 노출 (필요한 경우)
EXPOSE 8000

# Django 서버 실행
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "back.asgi:application"]