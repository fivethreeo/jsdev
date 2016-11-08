#!/bin/sh
if test -z "$1"; then
    echo "Usage: $(basename "$0" .sh) program [argument]..."
    exit 1
fi

program=$1
shift
echo "$program" ${@:1:$#-1} $(cygpath -w "${@: -1}") 
if test $# -ge 0; then
    IFS=$'\n'
    "$program" ${@:1:$#-1} $(cygpath -w "${@: -1}")
else
    "$program"
fi