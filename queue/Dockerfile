FROM rabbitmq:3-management

RUN rabbitmq-plugins --offline enable rabbitmq_peer_discovery_etcd
COPY rabbitmq.conf /etc/rabbitmq/
