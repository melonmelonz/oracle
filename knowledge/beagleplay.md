---
title: The BeaglePlay and SPI Display Bring-up
domain: kernel
tags: [beagleplay, single-board-computer, am625, cortex-a53, device-tree, spi, ili9341, linux, embedded]
vocab:
  - { term: BeaglePlay, def: "An open-hardware single-board computer from the BeagleBoard.org Foundation built around the TI AM625 SoC." }
  - { term: AM625, def: "A Texas Instruments Sitara application processor with a quad-core Cortex-A53 cluster and several real-time cores." }
  - { term: Cortex-A53, def: "A 64-bit Arm application core designed for power efficiency, used in clusters of up to four on the AM625." }
  - { term: Single-Board Computer, def: "A complete computer on one board running a full operating system, distinct from a bare-metal microcontroller." }
  - { term: Device Tree, def: "A data structure that describes hardware to the kernel so drivers can bind without that knowledge being compiled in." }
  - { term: Device Tree Overlay, def: "A fragment that patches the base device tree to add or enable a peripheral without editing the main file." }
  - { term: ILI9341, def: "A single-chip TFT LCD driver for 240 by 320 panels that accepts a 3- or 4-line SPI interface." }
  - { term: Chip Select, def: "An SPI line the controller asserts low to address one specific peripheral on a shared bus." }
  - { term: Data/Command, def: "An extra GPIO on many SPI displays that tells the panel whether incoming bytes are pixel data or a command." }
  - { term: Serial Console, def: "A text terminal exposed over a UART, giving boot logs and a login shell before any network or display works." }
related: [spi-bus, rust-for-linux, linux-kernel]
source: "BeagleBoard.org docs, TI AM625 datasheet, ILI9341 datasheet (Adafruit mirror), kernel panel-mipi-dbi-spi.yaml binding; June 2026"
links:
  - { title: "BeaglePlay documentation", url: "https://docs.beagleboard.org/latest/boards/beagleplay/index.html", kind: manual }
  - { title: "TI AM625 product page", url: "https://www.ti.com/product/AM625", kind: datasheet }
  - { title: "TI AM625 datasheet PDF", url: "https://www.ti.com/lit/ds/symlink/am625.pdf", kind: datasheet }
  - { title: "ILI9341 datasheet PDF", url: "https://cdn-shop.adafruit.com/datasheets/ILI9341.pdf", kind: datasheet }
  - { title: "Linux panel-mipi-dbi-spi binding", url: "https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/Documentation/devicetree/bindings/display/panel/panel-mipi-dbi-spi.yaml", kind: source }
---

# The BeaglePlay and SPI Display Bring-up

## The Board

BeaglePlay is an open-hardware single-board computer from the BeagleBoard.org Foundation, introduced in March 2023 at a list price of 99 USD. It is built around the Texas Instruments AM625, a Sitara application processor. The board carries 2 GB of DDR4 RAM and 16 GB of eMMC flash soldered down, so it boots a full Debian Linux image out of the box. Its outward face is unusually rich for the price: full-size HDMI, a gigabit Ethernet RJ45, a single-pair Ethernet RJ11 (10 Mbps but long reach), dual-band Wi-Fi, Bluetooth LE, a sub-GHz radio, a USB-A host port, and a USB-C port used for both power and a serial console. For expansion it exposes a mikroBUS socket, a Grove connector, and a QWIIC connector, plus MIPI display and camera interfaces. The intent is general: it is a learning and prototyping machine that happens to use industrial-grade silicon rather than a hobby-tier chip.

## The AM625 SoC

The AM625 is heterogeneous. Its headline cluster is four Arm Cortex-A53 cores, 64-bit application cores that run at up to 1.4 GHz and share 512 KB of L2 cache; each core has 32 KB of L1 instruction and 32 KB of L1 data cache. These are the cores Linux schedules on. Alongside them the SoC carries auxiliary cores that do not run the main OS: a Cortex-M4F for low-power and safety tasks and a dual-core Programmable Real-Time Unit subsystem for deterministic I/O. The silicon also contains a Cortex-R5 core, but on the AM625 it is reserved for device management and system firmware rather than exposed as a user-programmable core, so the only customer-usable auxiliary cores are the M4F and the PRU pair. User-accessible R5F cores show up on sibling Sitara parts such as the AM62P and AM64x, not on the AM625. A PowerVR-class 3D GPU drives up to two displays and supports OpenGL ES and Vulkan. TI positions the part for human-machine-interaction and industrial work, which is why it ships in industrial and automotive temperature grades. For someone bringing up a small display, the relevant fact is simpler: the Cortex-A53 cluster is where the kernel, the device tree, and any SPI driver actually live.

## Single-Board Computer Versus Microcontroller

The phrase single-board computer marks a real boundary, not marketing. A microcontroller such as an STM32 or an AVR runs one program directly on the metal, with kilobytes of RAM and no operating system underneath. A single-board computer like BeaglePlay runs a general-purpose kernel, Linux here, with virtual memory, process scheduling, a filesystem, and loadable drivers. That changes how you attach hardware. On a microcontroller you write to a peripheral register and the wire moves. On Linux you do not touch registers from an application; you tell the kernel what is wired up, the kernel binds a driver, and the driver owns the register. The cost is indirection. The benefit is that the same SPI display code works across boards once each board describes its own pins. The device tree is the seam where that description lives.

## The Serial Console

Before a network comes up and long before any HDMI or SPI display works, the serial console is how you watch a board boot and how you log in when something is wrong. BeaglePlay exposes its debug UART through the USB-C connector by way of an onboard USB-to-serial bridge, so a single cable carries both power and the console. The conventional settings are 115200 baud, eight data bits, no parity, one stop bit, with no hardware flow control. A terminal program such as picocom, minicom, or screen attaches to the resulting device node and shows the bootloader, the kernel ring buffer, and eventually a login prompt. This channel is text only and narrow, but it is the most reliable diagnostic on the board; when a display overlay fails to bind, the dmesg output that explains why arrives here.

## Device Tree and Overlays

Some buses announce what is plugged into them. PCI and USB are discoverable; the host can ask a device to identify itself. SPI cannot. The bus is just clock, data, and a select line, with no protocol for a peripheral to say what it is. So the kernel has to be told, in advance, that a given chip sits on a given chip-select at a given speed. On Arm Linux that description is the device tree: a hierarchy of nodes giving addresses, clocks, GPIOs, pin multiplexing, and a compatible string that the kernel matches against a driver. A device tree overlay is a patch against that base tree. Rather than editing the board's main .dts, you write a small fragment that targets the SPI controller node, sets its status to "okay", and adds a child node for your display. Compiled to a .dtbo and applied, it brings up the new device and leaves the rest of the system untouched. Overlays are the normal way to wire an add-on board on BeaglePlay.

## The ILI9341 Panel

The ILI9341 is a single-chip driver for small color TFT LCDs, common on 2.2 to 3.2 inch modules. Its native resolution is 240 by 320 pixels (240 RGB by 320), it drives 262,144 colors, and it carries 172,800 bytes of internal graphics RAM so it can hold a full frame on-chip. It accepts a parallel bus, an RGB bus, or a 3- or 4-line SPI interface, and it runs at 1.65 to 3.3 V on its I/O lines, which matches BeaglePlay's 3.3 V logic. Wiring it over SPI needs more than the bus itself. SPI supplies clock (SCLK), host-to-device data (MOSI), and a chip-select line the controller asserts low to address this panel. On top of that the display needs a data/command GPIO, often labelled D/CX, which is high when the bytes are pixel data and low when they are a command; in 4-line mode this pin is mandatory, and omitting it puts the part in 3-line mode where the bit is sent inline. A reset GPIO is also wired so the host can hard-reset the controller before initialization.

## Binding a Driver

Once the overlay describes the panel, the kernel still has to attach a driver to it. The matching is done by the compatible string. The old fbtft framebuffer drivers handled these panels for years but have been deprecated and largely removed; the current path is DRM. A dedicated tinydrm driver for the ILI9341 exists, and a generic panel-mipi-dbi-spi driver covers DBI-compatible SPI panels by reading width, height, and an initialization sequence supplied as a firmware blob rather than hardcoding them. The kernel binding for these drivers defines dc-gpios for the data/command line and reset-gpios for the reset line. One sharp edge is worth naming: the modern DRM drivers expect the reset line as GPIO_ACTIVE_HIGH, the opposite of the active-low convention the old fbtft overlays used, and getting that polarity wrong is a frequent cause of a blank or all-white panel. The same binding is what a Rust driver in the kernel would match against; the language of the driver changes, but the device tree contract it binds to does not.
