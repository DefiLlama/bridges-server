FROM postgres:latest

ENV POSTGRES_DB=mydatabase
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=password

COPY ./sql/data.sql /docker-entrypoint-initdb.d/