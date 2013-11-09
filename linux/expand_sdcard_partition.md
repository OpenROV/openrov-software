From the command line or a terminal window enter the following

sudo fdisk /dev/mmcblk0
then type p to list the partition table

you should see three partitions. if you look in the last column labeled System you should have

W95 FAT32
Linux
Linux Swap
make a note of the start number for partiton 2, you will need this later. though it will likely still be on the screen (just in case).

next type d to delete a partition.

You will then be prompted for the number of the partition you want to delete. In the case above you want to delete both the Linux and Linux swap partitions.

So type 2

then type d again and then type 3 to delete the swap partition.

Now you can resize the main partition.

type n to create a new partition.

This new partition needs to be a primary partition so type p.

Next enter 2 when prompted for a partition number.

You will now be prompted for the first sector for the new partition. Enter the start number from the earlier step (the Linux partition)

Next you will be prompted for the last sector you can just hit enter to accept the default which will utilize the remaining disk space.

Type w to save the changes you have made.

Next reboot the system with the following command:

sudo reboot
once the system has reboot and you are back at the commandline enter the following command:

sudo resize2fs /dev/mmcblk0p2
Note: this can take a long time (depending on the card size and speed) be patient and let it finish so you do not mess up the file system and have to start from scratch.

Once it is done reboot the system with the following command:

sudo reboot
You can now verify that the system is using the full capacity of the SD Card by entering the following command:

df -h
