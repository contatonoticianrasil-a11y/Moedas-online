/* =========================================================
   GONÇALVES CÂMBIO
   DASHBOARD - SISTEMA DE PROPAGANDAS V2
========================================================= */

const SUPABASE_URL =
  "https://skfodedzzdeptnksufuq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_TDC6NwdHx1XuYhXcFzxkiQ_1N6lLkGE";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );


/* =========================================================
   ELEMENTOS
========================================================= */

const $ = (id) =>
  document.getElementById(id);


/* =========================================================
   LOGIN
========================================================= */

async function verificarLogin() {

  try {

    const {
      data,
      error
    } = await supabaseClient.auth.getSession();

    if (error) {
      console.error(error);
      window.location.href = "index.html";
      return false;
    }

    if (!data.session) {
      window.location.href = "index.html";
      return false;
    }

    const usuario =
      $("usuarioLogado");

    if (usuario) {
      usuario.textContent =
        data.session.user.email ||
        "Administrador";
    }

    return true;

  } catch (erro) {

    console.error(
      "Erro no login:",
      erro
    );

    window.location.href =
      "index.html";

    return false;
  }
}


/* =========================================================
   CARREGAR PROPAGANDAS
========================================================= */

async function carregarAnuncios() {

  const grid =
    $("adsGrid");

  const loading =
    $("loading");

  const empty =
    $("emptyState");

  if (!grid) return;

  if (loading) {
    loading.classList.remove("hidden");
  }

  if (empty) {
    empty.classList.add("hidden");
  }

  grid.innerHTML = "";

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("anuncios")
        .select("*")
        .order("id", {
          ascending: false
        });

    if (error) {
      throw error;
    }

    if (loading) {
      loading.classList.add("hidden");
    }

    atualizarResumo(
      data || []
    );

    if (!data || data.length === 0) {

      if (empty) {
        empty.classList.remove("hidden");
      }

      return;
    }

    grid.innerHTML =
      data
        .map(criarCard)
        .join("");

  } catch (erro) {

    console.error(
      "Erro ao carregar anúncios:",
      erro
    );

    if (loading) {
      loading.classList.add("hidden");
    }

    grid.innerHTML = `
      <div class="error">
        ❌ Não foi possível carregar as propagandas.
        <br><br>
        <small>${escapeHTML(
          erro.message
        )}</small>
      </div>
    `;

  }
}


/* =========================================================
   RESUMO
========================================================= */

function atualizarResumo(
  anuncios
) {

  const total =
    anuncios.length;

  const ativos =
    anuncios.filter(
      anuncio =>
        anuncio.ativo === true
    ).length;

  const inativos =
    total - ativos;

  if ($("totalAds")) {
    $("totalAds").textContent =
      total;
  }

  if ($("activeAds")) {
    $("activeAds").textContent =
      ativos;
  }

  if ($("inactiveAds")) {
    $("inactiveAds").textContent =
      inativos;
  }
}


/* =========================================================
   CRIAR CARD
========================================================= */

function criarCard(
  anuncio
) {

  const imagem =
    anuncio.imagem_url ||
    "https://via.placeholder.com/600x300?text=Goncalves+Cambio";

  const ativo =
    anuncio.ativo === true;

  return `

    <article class="ad-card">

      <div class="ad-image">

        <img
          src="${escapeHTML(imagem)}"
          alt="${escapeHTML(
            anuncio.titulo ||
            "Propaganda"
          )}"
          onerror="
            this.src='https://via.placeholder.com/600x300?text=Imagem+indisponivel'
          "
        >

        <span class="${
          ativo
            ? "status-ativo"
            : "status-inativo"
        }">

          ${
            ativo
              ? "🟢 Ativo"
              : "🔴 Inativo"
          }

        </span>

      </div>


      <div class="ad-content">

        <h3>
          ${escapeHTML(
            anuncio.titulo ||
            "Sem título"
          )}
        </h3>

        <p>
          ${escapeHTML(
            anuncio.descricao ||
            "Sem descrição"
          )}
        </p>

        <div class="ad-link">

          🔗

          <span>
            ${escapeHTML(
              anuncio.link_url ||
              ""
            )}
          </span>

        </div>


        <div class="ad-footer">

          <button
            type="button"
            class="edit-btn"
            onclick="editarAnuncio(${anuncio.id})"
          >
            ✏️ Editar
          </button>

          <button
            type="button"
            class="toggle-btn"
            onclick="alternarAnuncio(
              ${anuncio.id},
              ${!ativo}
            )"
          >

            ${
              ativo
                ? "🔴 Desativar"
                : "🟢 Ativar"
            }

          </button>

          <button
            type="button"
            class="delete-btn"
            onclick="excluirAnuncio(
              ${anuncio.id}
            )"
          >
            🗑️ Excluir
          </button>

        </div>

      </div>

    </article>

  `;
}


/* =========================================================
   ABRIR MODAL
========================================================= */

function abrirModal(
  anuncio = null
) {

  const modal =
    $("modalOverlay");

  const form =
    $("adForm");

  if (!modal || !form) {
    console.error(
      "Modal ou formulário não encontrado."
    );
    return;
  }

  form.reset();

  $("adId").value =
    anuncio
      ? anuncio.id
      : "";

  $("titulo").value =
    anuncio?.titulo ||
    "";

  $("imagem_url").value =
    anuncio?.imagem_url ||
    "";

  $("link_url").value =
    anuncio?.link_url ||
    "";

  $("descricao").value =
    anuncio?.descricao ||
    "";

  $("intervalo_minutos").value =
    anuncio?.tempo_minutos ??
    0;

  $("ativo").checked =
    anuncio
      ? anuncio.ativo
      : true;

  const tituloModal =
    $("modalTitle");

  if (tituloModal) {

    tituloModal.textContent =
      anuncio
        ? "Editar propaganda"
        : "Nova propaganda";

  }

  atualizarPreview();

  modal.classList.remove(
    "hidden"
  );

  document.body.classList.add(
    "modal-open"
  );
}


/* =========================================================
   FECHAR MODAL
========================================================= */

function fecharModal() {

  const modal =
    $("modalOverlay");

  if (!modal) return;

  modal.classList.add(
    "hidden"
  );

  document.body.classList.remove(
    "modal-open"
  );
}


/* =========================================================
   PREVISUALIZAÇÃO DA IMAGEM
========================================================= */

function atualizarPreview() {

  const url =
    $("imagem_url")?.value.trim();

  const preview =
    $("imagePreview");

  const imagem =
    $("previewImg");

  if (!preview || !imagem) {
    return;
  }

  if (!url) {

    preview.classList.add(
      "hidden"
    );

    imagem.removeAttribute(
      "src"
    );

    return;
  }

  imagem.src =
    url;

  preview.classList.remove(
    "hidden"
  );
}


/* =========================================================
   SALVAR
========================================================= */

async function salvarAnuncio(
  event
) {

  event.preventDefault();

  const id =
    $("adId")?.value;

  const titulo =
    $("titulo")?.value.trim();

  const imagem =
    $("imagem_url")?.value.trim();

  const link =
    $("link_url")?.value.trim();

  const descricao =
    $("descricao")?.value.trim();

  const intervalo =
    Number(
      $("intervalo_minutos")?.value ||
      0
    );

  const ativo =
    $("ativo")?.checked === true;

  const mensagem =
    $("formMessage");

  const botao =
    $("saveBtn");


  if (!titulo) {

    mostrarMensagem(
      mensagem,
      "Digite o título da propaganda.",
      "error"
    );

    return;
  }


  if (!link) {

    mostrarMensagem(
      mensagem,
      "Digite o link da propaganda.",
      "error"
    );

    return;
  }


  const dados = {

    titulo:

      titulo,

    imagem_url:

      imagem || null,

    link_url:

      link,

    descricao:

      descricao || null,

    ativo:

      ativo,

    tempo_minutos:

      Number.isFinite(intervalo)
        ? Math.max(
            0,
            intervalo
          )
        : 0

  };


  try {

    if (botao) {

      botao.disabled =
        true;

      botao.textContent =
        "⏳ Salvando...";

    }


    let resultado;


    if (id) {

      resultado =
        await supabaseClient
          .from("anuncios")
          .update(dados)
          .eq("id", id);

    } else {

      resultado =
        await supabaseClient
          .from("anuncios")
          .insert([
            dados
          ]);

    }


    if (resultado.error) {
      throw resultado.error;
    }


    fecharModal();

    await carregarAnuncios();

    mostrarToast(
      id
        ? "Propaganda atualizada!"
        : "Propaganda criada com sucesso!"
    );


  } catch (erro) {

    console.error(
      "Erro ao salvar:",
      erro
    );

    mostrarMensagem(
      mensagem,
      "Erro ao salvar: " +
      erro.message,
      "error"
    );

  } finally {

    if (botao) {

      botao.disabled =
        false;

      botao.textContent =
        "💾 Salvar propaganda";

    }

  }
}


/* =========================================================
   EDITAR
========================================================= */

async function editarAnuncio(
  id
) {

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("anuncios")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
      throw error;
    }

    abrirModal(
      data
    );

  } catch (erro) {

    console.error(
      erro
    );

    mostrarToast(
      "Não foi possível carregar a propaganda.",
      true
    );

  }
}


/* =========================================================
   ATIVAR / DESATIVAR
========================================================= */

async function alternarAnuncio(
  id,
  novoStatus
) {

  try {

    const {
      error
    } =
      await supabaseClient
        .from("anuncios")
        .update({
          ativo:
            novoStatus
        })
        .eq(
          "id",
          id
        );

    if (error) {
      throw error;
    }

    await carregarAnuncios();

    mostrarToast(
      novoStatus
        ? "Propaganda ativada!"
        : "Propaganda desativada!"
    );

  } catch (erro) {

    console.error(
      erro
    );

    mostrarToast(
      "Não foi possível alterar o status.",
      true
    );

  }
}


/* =========================================================
   EXCLUIR
========================================================= */

async function excluirAnuncio(
  id
) {

  if (
    !confirm(
      "Deseja realmente excluir esta propaganda?"
    )
  ) {
    return;
  }


  try {

    const {
      error
    } =
      await supabaseClient
        .from("anuncios")
        .delete()
        .eq(
          "id",
          id
        );

    if (error) {
      throw error;
    }

    await carregarAnuncios();

    mostrarToast(
      "Propaganda excluída!"
    );

  } catch (erro) {

    console.error(
      erro
    );

    mostrarToast(
      "Não foi possível excluir.",
      true
    );

  }
}


/* =========================================================
   MENSAGEM
========================================================= */

function mostrarMensagem(
  elemento,
  texto,
  tipo = "error"
) {

  if (!elemento) return;

  elemento.textContent =
    texto;

  elemento.className =
    "form-message " +
    tipo;
}


/* =========================================================
   TOAST
========================================================= */

function mostrarToast(
  texto,
  erro = false
) {

  const toast =
    $("toast");

  if (!toast) {

    alert(texto);

    return;
  }

  toast.textContent =
    texto;

  toast.className =
    erro
      ? "toast show error"
      : "toast show";

  setTimeout(
    () => {
      toast.classList.remove(
        "show"
      );
    },
    3000
  );
}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escapeHTML(
  valor
) {

  return String(
    valor ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}


/* =========================================================
   EVENTOS
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    $("year").textContent =
      new Date().getFullYear();


    const autenticado =
      await verificarLogin();

    if (!autenticado) {
      return;
    }


    /* NOVA PROPAGANDA */

    $("newAdBtn")
      ?.addEventListener(
        "click",
        () => abrirModal()
      );


    $("emptyNewBtn")
      ?.addEventListener(
        "click",
        () => abrirModal()
      );


    /* FECHAR */

    $("closeModalBtn")
      ?.addEventListener(
        "click",
        fecharModal
      );


    $("cancelBtn")
      ?.addEventListener(
        "click",
        fecharModal
      );


    /* FORMULÁRIO */

    $("adForm")
      ?.addEventListener(
        "submit",
        salvarAnuncio
      );


    /* PREVIEW */

    $("imagem_url")
      ?.addEventListener(
        "input",
        atualizarPreview
      );


    /* STATUS */

    $("ativo")
      ?.addEventListener(
        "change",
        () => {

          const texto =
            $("statusText");

          if (!texto) return;

          texto.textContent =
            $("ativo").checked
              ? "Ativo"
              : "Inativo";

        }
      );


    /* ATUALIZAR */

    $("refreshBtn")
      ?.addEventListener(
        "click",
        carregarAnuncios
      );


    $("refreshMenu")
      ?.addEventListener(
        "click",
        event => {

          event.preventDefault();

          carregarAnuncios();

        }
      );


    /* LOGOUT */

    $("logoutBtn")
      ?.addEventListener(
        "click",
        async () => {

          await supabaseClient
            .auth
            .signOut({
              scope: "local"
            });

          window.location.href =
            "index.html";

        }
      );


    /* FECHAR C
