import * as fs from "fs";
import * as path from "path";
import { FolloweeRepository } from "../application/FolloweeRepository";

export class FileSystemFolloweeRepository implements FolloweeRepository {
  constructor(private readonly followe) {}
}
