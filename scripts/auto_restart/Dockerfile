FROM debian:buster

COPY ./src /app
COPY ./run.sh /usr/bin/run.sh
RUN chmod +x /usr/bin/run.sh

CMD [ "/usr/bin/run.sh" ]