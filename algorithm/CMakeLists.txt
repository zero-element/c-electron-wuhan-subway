cmake_minimum_required(VERSION 3.17)
project(algorithm C)

set(CMAKE_C_STANDARD 11)

add_library(algorithm SHARED library.c library.h)