# Change '*.cpp' and '*.h' to the extension you want to remove whitespaces in.
find -name '*.ts' -print0 | xargs -r0 sed -e 's/[[:blank:]]\+$//' -i
