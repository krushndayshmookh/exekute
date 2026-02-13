FROM node:20-alpine
RUN adduser -D runner
RUN mkdir /code && chown runner:runner /code
USER runner
WORKDIR /code
