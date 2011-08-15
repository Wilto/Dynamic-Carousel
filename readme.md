# A Responsive Carousel
If there's one thing that can compete with lightboxes for “world’s most done-to-death jQuery plugin,” it’s carousels. However, everything I came across was using pixel values and not percentages—meaning I wasn’t finding much of anything that could be used on a responsive/flexible layout. So I built one.

## It Just Got Real
We got pagination, we got generated navigation, we got keyboard support, and we got accessibility for days.

### Pagination
You’ll notice there’s now an ```addPagination``` option. This loops through the slides and generates a list of fully-ARIA’d links to each slide, complete with keyboard support (arrow keys). There’s an associated ```slideHed``` option, which you’ll see in play on the first carousel—this allows you to use the value of an element within the slide as the text in the associated link. If none is specified, you get “Page 1,” “Page 2,” and so on, but that isn’t very helpful to a screen reader. Definitely think about using the ```slideHed``` option—even if you’re planning on hiding the text using ```text-indent``` or somesuch. Even in-page links should be meaningful.

I styled one of the examples, for the hell of it. You are free to steal this.

### Generated Next/Prev Links
You can do that now, using ```addNav```—this way, non-JS users don’t have mysterious, useless links floating around in their markup. You can, of course, still write them into the markup yourself (see the second example carousel).

### Auto-advance
This exists now. I was very hesitant, because I don’t generally like the idea of things flying around on the page without the user specifically requesting it. Currently it’s triggering a click event on the next/prev links, which means that this will only work if you’ve added them to the markup or opted for the script to generate them. This won’t be a requirement on the next release, but for now just hide ’em if the situation calls for it.

The auto-rotation stops on mouseover, as we can assume the user is interacting with the content at that point.

Also, I should probably mention how this works! There’s a data-autorotate attribute on the first carousel on the demo page, with the rotation’s timing in milliseconds. So… Do that. I’m good at writing documentation, is the main idea here.

### Keyboard Support
Arrow keys, when focus is on the next/prev links or the pagination tabs.

### Accessibility
Needs another pass in JAWS, but it’s a lot more usable from a screenreader perspective. You need not do a thing.
It does this for you. 

### Callback
The ```callback``` param, has been removed—you now have (namespaced) events to hook into! See the third carousel on the demo page for examples.

## It’s Gonna Get Realer
Improvements to the dragSnap event are coming down the Pike, thanks to one Mr. <a href="https://github.com/scottjehl">Scott Jehl</a>—mo’ smoother transitions, less chance of the slider getting snagged somewhere, etc.

<a href="https://github.com/richardwiggins">Richard Wiggins</a> has pointed out that one should be able to link to a specific slide. I dig it. It’s gonna happen.

## “Dynamic?” Isn’t that a little “DHTML for Dummies?”
I’m takin’ it back.