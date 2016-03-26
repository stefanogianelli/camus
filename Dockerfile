FROM node

# Bundle app source
COPY . /camus
WORKDIR /camus

# Install app dependencies
RUN npm install --production --quiet

EXPOSE  3001
CMD ["npm", "start"]