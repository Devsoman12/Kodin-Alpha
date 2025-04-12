# Use OpenJDK 11 with Maven installed
FROM maven:3.8.4-openjdk-11-slim

# Install necessary dependencies
RUN apt-get update

# Copy project source code and Maven configuration
COPY solution/src /usr/local/solution/src
COPY solution/pom.xml /usr/local/solution/pom.xml

# Set the working directory inside the container
WORKDIR /usr/local/solution

# Install project dependencies
RUN mvn clean install

# Run tests using Maven
RUN mvn clean install test

# Set the entrypoint to bash so you can run commands interactively
CMD ["bash"]
