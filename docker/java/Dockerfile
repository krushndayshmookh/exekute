FROM eclipse-temurin:21-jdk-alpine
RUN adduser -D -u 1000 runner
RUN mkdir /code && chown runner:runner /code
USER runner
WORKDIR /code
