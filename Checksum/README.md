# Checksum Algorithm Visualizer

A browser-based project that demonstrates the **Checksum error-detection technique** used in computer networks. It shows how a sender calculates a checksum, how data is transmitted, and how a receiver checks whether an error occurred.

## Features

- Enter binary data manually using space-separated segments.
- Choose a segment size of **4, 8, or 16 bits**.
- Generate random binary segments for testing.
- Calculate the checksum using **1's complement addition**.
- View the sender-side calculation step by step, including carry wraparound.
- Simulate data transmission with an animation.
- Optionally inject a bit error into a selected segment.
- View the receiver-side calculation and verification result.
- See a summary of the transmission.

## Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla JavaScript)

No frameworks, backend, database, or package installation are required.

## Project Structure

```text
Checksum/
├── index.html   # Page structure and interface
├── style.css    # Design, layout, and animations
└── script.js    # Checksum calculation and simulation logic
```

## How to Run

1. Download or clone this repository.
2. Open the `Checksum` project folder.
3. Double-click `index.html` to open it in your browser.

   **Recommended:** Open the folder in Visual Studio Code and run `index.html` using the Live Server extension.

There is no need to run `npm install` or any terminal command.

## How to Use

1. Enter binary data in the input box. Separate each segment with a space.
2. Select the matching segment size (4, 8, or 16 bits).
3. Alternatively, select the number of segments and click **Generate Random**.
4. Click **Calculate Checksum** to see the sender-side calculation.
5. In the transmission section, optionally enable **Inject bit error in transmission** and choose the segment and bit position.
6. Click **Transmit Data**.
7. Check the receiver-side result:
   - **Data is VALID:** the receiver's final 1's complement is all zeros.
   - **Error DETECTED:** the final result is non-zero.
8. Click **Reset** to start again.

### Example Input

For an 8-bit segment size:

```text
10101010 11001100 11110000 00001111
```

Make sure every segment contains only `0` and `1`, and that every segment has the selected number of bits.

## Checksum Algorithm

### Sender Side

1. Divide the data into equal-sized binary segments.
2. Add the segments using binary addition.
3. If an extra carry bit is produced, wrap it around and add it to the least significant end of the sum (end-around carry).
4. Take the 1's complement of the final sum. This is the checksum.
5. Append the checksum to the original data before transmission.

### Receiver Side

1. Receive all data segments along with the checksum.
2. Add all received segments using the same 1's complement addition method.
3. Apply end-around carry when required.
4. Take the 1's complement of the final sum.
5. If the result is all zeros, the data passes the checksum verification; otherwise, an error is detected.

> **Note:** A checksum is an error-detection method. It does not correct corrupted data, and some error patterns may not be detected.

## Learning Purpose

This project is intended for learning and demonstrating the checksum technique in Computer Networks. It helps visualize binary addition, carry handling, 1's complement, data transmission, and error detection.

## Author

Add your name here.
