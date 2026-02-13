FROM python:3.12-alpine
RUN adduser -D -u 1000 runner
RUN mkdir /code && chown runner:runner /code
USER runner
WORKDIR /code
