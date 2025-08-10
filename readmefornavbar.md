Key CSS Changes Explained:

max-width: 90vw;: Prevents the navbar from touching the edges on small screens.

overflow-x: auto;: This is the magic property. It tells the container to allow horizontal scrolling if the content inside (the ul) is wider than the container itself.

::-webkit-scrollbar, -ms-overflow-style, scrollbar-width: These rules hide the ugly default scrollbar, making the scrolling behavior look clean and modern.

white-space: nowrap;: Ensures that your navigation links like "How It Works" don't break into two lines.

👻 What is a "Ghost Button" in React (or any frontend framework)?
A Ghost Button is a transparent or semi-transparent button with:

No background color (or very light)

A visible border

Text in a solid color

It looks like a "ghost" of a regular button, hence the name.

🧠 Why Use Ghost Buttons?
They are often used for:

Secondary actions (not primary)

Minimalist designs

Modern UI — elegant and subtle