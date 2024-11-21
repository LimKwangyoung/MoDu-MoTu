# 1. 설정 파일 준비 단계
FROM alpine:latest AS config

# Nginx 설정 파일 복사
COPY default.conf /default.conf

# 2. 실행 단계: Nginx 이미지 사용
FROM nginx:latest

# 설정 파일 복사
COPY --from=config /default.conf /etc/nginx/conf.d/default.conf

# 포트 노출
EXPOSE 80 443

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
