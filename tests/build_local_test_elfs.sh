#!/bin/bash

# EDIT THIS: replace all `boilerplate` occurences with the name of your plugin.

# FILL THESE WITH YOUR OWN SDKs PATHS and APP-ETHEREUM's ROOT
NANOS_SDK=$TWO
NANOX_SDK=$X
APP_ETHEREUM=/home/spiriou/Code/app-ethereum

# create elfs folder if it doesn't exist
mkdir -p elfs

# move to repo's root to build apps
cd ..

echo "*Building elfs for Nano S..."

echo "**Building app-boilerplate for Nano S..."
make clean BOLOS_SDK=$NANOS_SDK
make -j DEBUG=1 BOLOS_SDK=$NANOS_SDK
cp bin/app.elf "tests/elfs/boilerplate_nanos.elf"

echo "**Building app-ethereum for Nano S..."
cd $APP_ETHEREUM
make clean BOLOS_SDK=$NANOS_SDK
make -j DEBUG=1 BYPASS_SIGNATURES=1 BOLOS_SDK=$NANOS_SDK CHAIN=ethereum
cd -
cp "${APP_ETHEREUM}/bin/app.elf" "tests/elfs/ethereum_nanos.elf"


echo "*Building elfs for Nano X..."

echo "**Building app-boilerplate for Nano X..."
make clean BOLOS_SDK=$NANOX_SDK
make -j DEBUG=1 BOLOS_SDK=$NANOX_SDK
cp bin/app.elf "tests/elfs/boilerplate_nanox.elf"

echo "**Building app-ethereum for Nano X..."
cd $APP_ETHEREUM
make clean BOLOS_SDK=$NANOX_SDK
make -j DEBUG=1 BYPASS_SIGNATURES=1 BOLOS_SDK=$NANOX_SDK CHAIN=ethereum
cd -
cp "${APP_ETHEREUM}/bin/app.elf" "tests/elfs/ethereum_nanox.elf"

echo "done"
