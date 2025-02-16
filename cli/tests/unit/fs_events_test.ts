// Copyright 2018-2019 the Deno authors. All rights reserved. MIT license.
import { assert, assertEquals, assertThrows, unitTest } from "./test_util.ts";

// TODO(ry) Add more tests to specify format.

unitTest({ permissions: { read: false } }, function watchFsPermissions() {
  assertThrows(() => {
    Deno.watchFs(".");
  }, Deno.errors.PermissionDenied);
});

unitTest({ permissions: { read: true } }, function watchFsInvalidPath() {
  if (Deno.build.os === "windows") {
    assertThrows(
      () => {
        Deno.watchFs("non-existant.file");
      },
      Error,
      "Input watch path is neither a file nor a directory",
    );
  } else {
    assertThrows(() => {
      Deno.watchFs("non-existant.file");
    }, Deno.errors.NotFound);
  }
});

async function getTwoEvents(
  iter: Deno.FsWatcher,
): Promise<Deno.FsEvent[]> {
  const events = [];
  for await (const event of iter) {
    events.push(event);
    if (events.length > 2) break;
  }
  return events;
}

unitTest(
  { permissions: { read: true, write: true } },
  async function watchFsBasic() {
    const testDir = Deno.makeTempDirSync();
    const iter = Deno.watchFs(testDir);

    // Asynchornously capture two fs events.
    const eventsPromise = getTwoEvents(iter);

    // Make some random file system activity.
    const file1 = testDir + "/file1.txt";
    const file2 = testDir + "/file2.txt";
    Deno.writeFileSync(file1, new Uint8Array([0, 1, 2]));
    Deno.writeFileSync(file2, new Uint8Array([0, 1, 2]));

    // We should have gotten two fs events.
    const events = await eventsPromise;
    assert(events.length >= 2);
    assert(events[0].kind == "create");
    assert(events[0].paths[0].includes(testDir));
    assert(events[1].kind == "create" || events[1].kind == "modify");
    assert(events[1].paths[0].includes(testDir));
  },
);

// TODO(kt3k): This test is for the backward compatibility of `.return` method.
// This should be removed at 2.0
unitTest(
  { permissions: { read: true, write: true } },
  async function watchFsReturn() {
    const testDir = Deno.makeTempDirSync();
    const iter = Deno.watchFs(testDir);

    // Asynchronously loop events.
    const eventsPromise = getTwoEvents(iter);

    // Close the watcher.
    await iter.return!();

    // Expect zero events.
    const events = await eventsPromise;
    assertEquals(events, []);
  },
);

unitTest(
  { permissions: { read: true, write: true } },
  async function watchFsClose() {
    const testDir = Deno.makeTempDirSync();
    const iter = Deno.watchFs(testDir);

    // Asynchronously loop events.
    const eventsPromise = getTwoEvents(iter);

    // Close the watcher.
    await iter.close();

    // Expect zero events.
    const events = await eventsPromise;
    assertEquals(events, []);
  },
);
