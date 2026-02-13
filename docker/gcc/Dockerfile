FROM alpine:3.20
RUN apk add --no-cache gcc g++ musl-dev
RUN adduser -D -u 1000 runner
RUN mkdir /code && chown runner:runner /code
USER runner
WORKDIR /code
