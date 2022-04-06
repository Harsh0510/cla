DEBIAN_FRONTEND=noninteractive apt update
DEBIAN_FRONTEND=noninteractive apt install -y curl sudo gnupg
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
DEBIAN_FRONTEND=noninteractive apt install -y nodejs pngquant fuse wget python fontconfig fonts-ebgaramond-extra libharfbuzz-dev libnss3 xdg-utils libxcomposite-dev
wget -nv -O- https://download.calibre-ebook.com/linux-installer.sh | sudo sh /dev/stdin
fc-cache -f -v
