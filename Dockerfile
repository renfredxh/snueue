# Build: sudo docker build -t snueue .
# Run: sudo docker run -p 8000:80 -i -t -d srctweb

# Set the base image to Ubuntu
FROM ubuntu:14.04

# File Author / Maintainer
MAINTAINER Renfred Harper

# Update the sources list
RUN apt-get update

# Install basic applications
RUN apt-get install -y tar git curl nano wget dialog net-tools build-essential

# Install Python and Basic Python Tools
RUN apt-get install -y python python-dev python-distribute python-pip software-properties-common

# Node for React Compiler
RUN apt-add-repository ppa:chris-lea/node.js
RUN apt-get update
RUN apt-get install -y nodejs

# Ruby and Compass
RUN apt-get install -y -qq ruby-dev
RUN apt-get install make

RUN gem install --no-rdoc --no-ri compass

# Get pip to download and install requirements:
RUN git clone https://github.com/renfredxh/snueue.git snueue
RUN pip install -r /snueue/requirements.txt

EXPOSE 80

WORKDIR /snueue/snueue

RUN python script/collectstatic.py

# Use Gunicorn to serve the application
CMD gunicorn app:app -b 0.0.0.0:80 --log-file - --access-logfile - --error-logfile -
