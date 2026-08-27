# Seed photos

`placeholder.jpg` is the ballroom photo, reused for every image slot in
`scripts/seed-content.mjs`. It is obviously a stand-in — swap it out before this
goes in front of the client.

To use real photos: drop the .jpg files in here, then change the `imageFile`
values in `scripts/seed-content.mjs` to match the new file names and re-run
`npm run seed`.

Useful ones to shoot or dig out:

```
the photo beside each opening paragraph   landscape, a finished floor in situ
three process shots                       inspect / clean / seal
one before + after pair                   same spot, same framing, same height
```

That last one does the most work on the page. A pair shot from the same position
is far more persuasive than two unrelated photos.

Landscape JPGs, at least 1600px wide. They are cropped to fixed shapes on the
page, so exact dimensions do not matter.

Anything you add here is git-ignored apart from this file and `placeholder.jpg`,
so real client photos will not get committed by accident.
