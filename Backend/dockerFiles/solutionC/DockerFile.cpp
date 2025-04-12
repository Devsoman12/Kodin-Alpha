FROM gcc:latest

RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    libcriterion-dev \
    build-essential \
    libpthread-stubs0-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/local/solution

COPY solutionC/solution.c /usr/local/solution/solution.c
COPY solutionC/tests.c /usr/local/solution/tests.c

CMD ["bash"]
