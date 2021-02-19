# Please modify FROM to <non-prod ACR being used for your builds>.azurecr.io/iceleap/cicd/base/ubuntu:18.04
FROM ubuntu:18.04
ENV HOME_PATH=/usr/src/app

# The following section needs to go away and should be in the base image
ENV VERSION=v10.15.0 NPM_VERSION=6.4.1 DISTRO=linux-x64
RUN apt-get update -qq && apt-get install -qqy zip wget git curl unzip sudo xz-utils
RUN \
	mkdir -p /usr/local/lib/nodejs && \
	curl -L https://nodejs.org/dist/$VERSION/node-$VERSION-$DISTRO.tar.xz -o node-$VERSION-$DISTRO.tar.xz && \
	tar -xJvf node-$VERSION-$DISTRO.tar.xz -C /usr/local/lib/nodejs && \
	ln -s /usr/local/lib/nodejs/node-$VERSION-$DISTRO/bin/node /usr/bin/node && \
	ln -s /usr/local/lib/nodejs/node-$VERSION-$DISTRO/bin/npm /usr/bin/npm && \
	ln -s /usr/local/lib/nodejs/node-$VERSION-$DISTRO/bin/npx /usr/bin/npx && \
	rm -f node-$VERSION-$DISTRO.tar.xz
ENV PATH="/usr/local/lib/nodejs/node-$VERSION-$DISTRO/bin:${PATH}"

RUN mkdir -p ${HOME_PATH}
WORKDIR ${HOME_PATH}
COPY build/eapi-customer-rest.zip ${HOME_PATH}

RUN unzip ${HOME_PATH}/eapi-customer-rest.zip -d ${HOME_PATH}
RUN rm -f ${HOME_PATH}/eapi-customer-rest.zip

EXPOSE 8080
CMD [ "npm", "run", "start" ]
