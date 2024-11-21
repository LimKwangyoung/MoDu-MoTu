# 1. 빌드 단계: Node.js 이미지를 사용하여 React 앱 빌드
FROM node:20-alpine AS build

WORKDIR /app

# 의존성 설치
COPY ./frontend/package*.json ./
RUN npm install

# 소스 코드 복사 및 빌드
COPY ./frontend/ ./
RUN npm run build

# 2. 실행 단계: Nginx를 사용하여 정적 파일 서빙
FROM nginx:latest AS production

# 빌드된 React 앱 복사
COPY --from=build /app/dist /usr/share/nginx/html

# 포트 노출
EXPOSE 5173

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
