{
  description = "Official SpacetimeDB CLI binaries";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/70ce234312134a463ba7728e94da2486a1d237ac";

  outputs =
    { nixpkgs, ... }:
    let
      version = "2.8.2";
      sources = {
        x86_64-linux = {
          url = "https://github.com/clockworklabs/SpacetimeDB/releases/download/v${version}/spacetime-x86_64-unknown-linux-gnu.tar.gz";
          hash = "sha256-Th9yZMJzDVwH59IBr68/tRSFncNp5JFvB9gAOWSDPwg=";
        };
        aarch64-linux = {
          url = "https://github.com/clockworklabs/SpacetimeDB/releases/download/v${version}/spacetime-aarch64-unknown-linux-gnu.tar.gz";
          hash = "sha256-C7ydLDc+DJOdsWE5YQtzYMCWWdJAgYwmBgT/our61R0=";
        };
        aarch64-darwin = {
          url = "https://github.com/clockworklabs/SpacetimeDB/releases/download/v${version}/spacetime-aarch64-apple-darwin.tar.gz";
          hash = "sha256-P8H2i+215f5S2QpUtfcRIRQNd6SoXV9upyO/4+XY+18=";
        };
        x86_64-darwin = {
          url = "https://github.com/clockworklabs/SpacetimeDB/releases/download/v${version}/spacetime-x86_64-apple-darwin.tar.gz";
          hash = "sha256-iJ4PpXMtGdYR3cGET4EB9EeorgAUabzFcteY+5IQpAQ=";
        };
      };
      mkSpacetime =
        system:
        let
          pkgs = import nixpkgs { inherit system; };
        in
        pkgs.stdenv.mkDerivation {
          pname = "spacetime";
          inherit version;
          src = pkgs.fetchurl {
            inherit (sources.${system}) url hash;
          };
          sourceRoot = ".";
          nativeBuildInputs = pkgs.lib.optionals pkgs.stdenv.isLinux [ pkgs.autoPatchelfHook ];
          buildInputs = pkgs.lib.optionals pkgs.stdenv.isLinux [
            pkgs.zlib
            pkgs.stdenv.cc.cc.lib
          ];
          dontConfigure = true;
          dontBuild = true;
          installPhase = ''
            runHook preInstall
            mkdir -p $out/bin
            cp spacetimedb-cli $out/bin/spacetime
            cp spacetimedb-standalone $out/bin/spacetimedb-standalone
            chmod +x $out/bin/spacetime $out/bin/spacetimedb-standalone
            runHook postInstall
          '';
          meta = {
            description = "Official SpacetimeDB CLI";
            homepage = "https://spacetimedb.com";
            mainProgram = "spacetime";
          };
        };
    in
    {
      packages = nixpkgs.lib.mapAttrs (system: _: rec {
        default = mkSpacetime system;
        spacetime = default;
      }) sources;
    };
}
