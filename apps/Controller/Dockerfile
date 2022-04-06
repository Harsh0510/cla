FROM node:16.14-alpine

RUN apk update
RUN apk add openssh && echo "root:Docker!" | chpasswd
COPY sshd_config /etc/ssh/
COPY ssh_setup.sh /tmp
RUN chmod -R +x /tmp/ssh_setup.sh && (sleep 1;/tmp/ssh_setup.sh 2>&1 > /dev/null)

EXPOSE 80 2222

CMD [ "/docker/run.sh" ]