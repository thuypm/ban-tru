tar --exclude=node_modules -czf server.tar.gz server
scp server.tar.gz root@172.93.187.215:/home/myapp/
ssh root@172.93.187.215 "cd /home/myapp && tar -xzf server.tar.gz && rm server.tar.gz"
