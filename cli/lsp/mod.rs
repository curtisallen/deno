// Copyright 2018-2021 the Deno authors. All rights reserved. MIT license.

use deno_core::error::AnyError;
use lspower::LspService;
use lspower::Server;

mod analysis;
mod cache;
mod capabilities;
mod code_lens;
mod completions;
mod config;
mod diagnostics;
mod document_source;
mod documents;
pub(crate) mod language_server;
mod lsp_custom;
mod parent_process_checker;
mod path_to_regex;
mod performance;
mod refactor;
mod registries;
mod semantic_tokens;
mod sources;
mod text;
mod tsc;
mod urls;

pub async fn start() -> Result<(), AnyError> {
  let stdin = tokio::io::stdin();
  let stdout = tokio::io::stdout();

  let (service, messages) =
    LspService::new(language_server::LanguageServer::new);
  Server::new(stdin, stdout)
    .interleave(messages)
    .serve(service)
    .await;

  Ok(())
}
