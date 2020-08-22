# File organizer for Windows context menu

Creating ERP for an important warehouse in Pereira, we discovered the products photography process was so disordered and complex to upload to our ERP system, so that I developed a tool to speed up the process when the photographies are taken.

Before thinking in some web or mobile app, I found that the users needed to transfer their photos to PC, usually PCs with Windows OS, so, I decided to create a tool that it can be executed on the windows context menu.

![Context Menu Example](https://github.com/dvariaz/file-organizer/blob/master/docs/screenshots/ContextMenu.png?raw=true)
![App Running](https://github.com/dvariaz/file-organizer/blob/master/docs/screenshots/AppRunning.png?raw=true)

The app renames, compress and pack in new folder with the product reference specified.

## Implementation

I decided to use Electron.js to take advantage of my Javascript Skills and the power of modern apps but running on Desktop.

### Tools

-   Electron.js (Electron-Forge)
-   Node.js File System
-   Sharp
