CC = gcc
CFLAGS = -g -pedantic -ftest-coverage -fprofile-arcs 


CFLAGS += -std=c99 -Wpedantic -pedantic-errors
CFLAGS += -Werror
CFLAGS += -Wall
CFLAGS += -Wextra
CFLAGS += -Waggregate-return
CFLAGS += -Wbad-function-cast
CFLAGS += -Wcast-align
CFLAGS += -Wcast-qual
CFLAGS += -Wdeclaration-after-statement
CFLAGS += -Wfloat-equal
CFLAGS += -Wformat=2
CFLAGS += -Wlogical-op
CFLAGS += -Wmissing-declarations
CFLAGS += -Wmissing-include-dirs
CFLAGS += -Wmissing-prototypes
CFLAGS += -Wnested-externs
CFLAGS += -Wpointer-arith
CFLAGS += -Wredundant-decls
CFLAGS += -Wsequence-point
CFLAGS += -Wshadow
CFLAGS += -Wstrict-prototypes
CFLAGS += -Wswitch
CFLAGS += -Wundef
CFLAGS += -Wunreachable-code
CFLAGS += -Wunused-but-set-parameter
CFLAGS += -Wwrite-strings


CUNIT_INCLUDE = -lcunit
PROFILER = gprof
MEMTEST_TOOL = valgrind
MEMTEST_OPTIONS =--leak-check=full --show-leak-kinds=all --track-origins=yes --verbose --log-file=log_files/valgrind-out.txt 

SOURCE_FILES = $(shell find src/c -type f -name '*.c')
SOURCE_OBJECTS = $(patsubst src/c/%.c,obj/src/c/%.o,$(SOURCE_FILES))
DEMO_FILES = $(wildcard demo/*.c)
DEMO_OBJECTS = $(patsubst demo/%.c,obj/demo/%.o,$(DEMO_FILES))
TEST_FILES = $(wildcard test/*.c)
TEST_OBJECTS = $(patsubst test/%.c,obj/test/%.o,$(TEST_FILES))

.PHONY: clean test memtest demo

compile: $(SOURCE_OBJECTS)

# Compile test suites
compile_tests: compile $(TEST_OBJECTS)
	$(CC) $(SOURCE_OBJECTS) $(TEST_OBJECTS) $(CFLAGS) -o unit_tests $(CUNIT_INCLUDE)

# Compile and run test suites
test: compile_tests
	./unit_tests
	find obj -type f -name '*.gc*' -exec mv {} cov_files \;

# Compile and run test suites with valgrind
memtest: compile_tests
	$(MEMTEST_TOOL) ./unit_tests $(MEMTEST_OPTIONS)

# Run demo with assignment from phase 1
demo:
	echo "Not implemented"

# Do memory and time profiling for the garbage collector
prof:
	echo "Not implemented"

# Run coverage checks on the garbage collector with the test files
cov: compile_tests
	make test
	lcov --capture --directory ./coverage --output-file coverage.info
	genhtml coverage.info --output-directory coverage-results
	open coverage-results/index.html

# Install all dependencies needed to run the program
install:
	# CUnit
	sudo apt install -y libcunit1 libcunit1-doc libcunit1-dev

	# Valgrind
	sudo apt install -y valgrind

	# lcov
	sudo apt install -y lcov

obj/%.o: %.c
	mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -rf obj/*
	rm -f ./test/unit_tests
	rm -rf cov_files/*
