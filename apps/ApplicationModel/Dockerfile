FROM postgres:10.11

COPY ./docker/run.sh /docker-entrypoint-initdb.d/db_init.sh
RUN chmod +x /docker-entrypoint-initdb.d/db_init.sh

CMD [ "postgres" ]