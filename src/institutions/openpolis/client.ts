// @ts-nocheck - REST client uses global fetch (Node >=18); disabled for build compatibility

/**
 * OpenPolis "Openparlamento" (OPDM) REST client — dati CURATI della legislatura corrente.
 *
 * A differenza di Camera/Senato (SPARQL grezzo), OpenPolis fornisce dati arricchiti: indice di forza,
 * statistiche di presenza, coesione delle votazioni, stato di conversione dei decreti.
 *
 * Accesso anonimo (10.000 richieste/giorno). OPENPOLIS_TOKEN (JWT) opzionale per alzare i limiti.
 * Licenza CC-BY-NC: attribuzione "Fonte: Openpolis" obbligatoria, uso non commerciale.
 */

const API = process.env.OPENPOLIS_API || 'https://service.opdm.openpolis.io/api-openparlamento/v1';
const LEG = process.env.OPENPOLIS_LEG || '19'; // XIX legislatura
const TOKEN = process.env.OPENPOLIS_TOKEN || '';
const TTL = parseInt(process.env.OPENPOLIS_TTL || '900', 10) * 1000; // ms; 0 = cache off

const _cache = new Map<string, { t: number; data: any }>();

async function op(resource: string, params: Record<string, any> = {}): Promise<any> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
  }
  const url = `${API}/${LEG}/${resource.replace(/^\//, '')}${qs.toString() ? '?' + qs.toString() : ''}`;
  const now = Date.now();
  if (TTL > 0) {
    const hit = _cache.get(url);
    if (hit && now - hit.t < TTL) return hit.data;
  }
  const headers: Record<string, string> = {
    'User-Agent': 'republic-mcp/openpolis',
    Accept: 'application/json',
  };
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`OpenPolis HTTP ${res.status} su ${resource}`);
  const data = await res.json();
  if (TTL > 0) _cache.set(url, { t: now, data });
  return data;
}

const names = (lst: any[], n = 3): string[] =>
  (lst || [])
    .map((s) => (typeof s === 'string' ? s : s?.name || s?.full_name || s?.slug))
    .filter(Boolean)
    .slice(0, n);

export const OpenPolisClient = {
  async cercaParlamentari(testo = '', ruolo = '', soloAttivi = true) {
    const d = await op('persons/', {
      search: testo,
      role: ruolo,
      is_active: soloAttivi ? 'True' : '',
      ordering: '-pp',
      page_size: 10,
    });
    return {
      totale: d.count ?? 0,
      parlamentari: (d.results || []).slice(0, 10).map((r: any) => ({
        nome: r.name,
        ruoli: r.roles,
        attivo: r.is_active,
        immagine: r.image,
        slug: r.slug,
        url: r.url,
        fonte: 'Openpolis',
      })),
      fonte: 'Openpolis',
    };
  },

  async indiceDiForza(ramo = '', limite = 10) {
    const lim = Math.max(1, Math.min(Number(limite) || 10, 50));
    const params: Record<string, any> = { ordering: '-pp', page_size: lim };
    const branch = { camera: 'C', senato: 'S' }[(ramo || '').toLowerCase()];
    if (branch) params.branch = branch;
    const d = await op('persons/pp_index/', params);
    return {
      totale: d.count ?? 0,
      indicatore: 'Indice di forza (pp)',
      classifica: (d.results || []).slice(0, lim).map((r: any) => {
        const pp = r.pp || {};
        const cr = r.current_roles || {};
        const govRoles = (cr.gov || {}).roles || [];
        const parl = cr.parl || {};
        const ruolo = govRoles.length
          ? `${govRoles[0].role} — ${govRoles[0].org_name}`
          : (parl.latest_group || {}).name || parl.role;
        return {
          posizione: pp.pp_branch_ordering,
          punteggio: typeof pp.pp_branch === 'number' ? Math.round(pp.pp_branch * 100) / 100 : pp.pp_branch,
          nome: r.name,
          ruolo,
          immagine: r.image,
          slug: r.slug,
          url: r.url,
          fonte: 'Openpolis',
        };
      }),
      fonte: 'Openpolis',
    };
  },

  async profiloParlamentare(nome = '') {
    const lst = await op('persons/', { search: nome, page_size: 1 });
    const res = lst.results || [];
    if (!res.length) return { trovato: false, messaggio: `Parlamentare '${nome}' non trovato.`, fonte: 'Openpolis' };
    const slug = res[0].slug;
    const publicUrl = res[0].url;
    const d = await op(`persons/${slug}/`);
    if (!d.slug) return { trovato: false, messaggio: `Scheda di '${nome}' non disponibile.`, fonte: 'Openpolis' };
    const parl = (d.current_roles || {}).parl || {};
    const grp = parl.latest_group || {};
    const pp = d.pp || {};
    const nascita = [d.birth_date, d.birth_place ? `(${d.birth_place})` : null].filter(Boolean).join(' ');
    return {
      trovato: true,
      slug,
      profilo: {
        nome: `${d.given_name || ''} ${d.family_name || ''}`.trim(),
        genere: d.gender,
        nascita: nascita || null,
        ruolo: parl.role,
        gruppo: grp.acronym ? { acronimo: grp.acronym, nome: grp.name, ramo: grp.branch } : null,
        collegio: parl.election_area,
        presenze: {
          presente: d.n_present,
          assente: d.n_absent,
          in_missione: d.n_mission,
          votazioni: d.n_voting,
          ribelle: d.n_rebels,
          giorni_in_parlamento: d.parse_days_in_parliament,
        },
        // pp del dettaglio = sola ATTIVITÀ PARLAMENTARE (basso per i ministri); l'indice di forza
        // COMPLESSIVO è in indice_di_forza()/pp_index.
        attivita_parlamentare: {
          pp_ramo: pp.pp_branch,
          posizione_ramo: pp.pp_branch_ordering,
          su_totale: pp.pp_branch_total_ordering,
        },
        immagine: d.image,
      },
      url: publicUrl,
      fonte: 'Openpolis',
    };
  },

  async cercaVotazioni(testo = '', soloVotiChiave = false, soloFinali = false, soloFiducia = false, esito = '') {
    const d = await op('votings/', {
      search: testo,
      is_key_vote: soloVotiChiave ? 'True' : '',
      is_final: soloFinali ? 'True' : '',
      is_confidence: soloFiducia ? 'True' : '',
      outcome: esito,
      page_size: 10,
    });
    return {
      totale: d.count ?? 0,
      votazioni: (d.results || []).slice(0, 10).map((r: any) => {
        const s = r.sitting || {};
        return {
          titolo: r.title,
          data: s.date,
          ramo: s.branch,
          numero: r.number,
          esito: r.outcome,
          voto_chiave: r.is_key_vote,
          voto_finale: r.is_final,
          fiducia: r.is_confidence,
          segreto: r.is_secret,
          ribelli: r.n_rebels,
          margine: r.n_margin,
          coesione_maggioranza: r.majority_cohesion_rate,
          coesione_minoranza: r.minority_cohesion_rate,
          url: r.url,
          fonte: 'Openpolis',
        };
      }),
      fonte: 'Openpolis',
    };
  },

  async decretiLegge(testo = '', stato = '') {
    const d = await op('govdecrees/', { search: testo, ordering: '-date_presenting', page_size: 15 });
    let items = d.results || [];
    if (stato) {
      const s = stato.toLowerCase();
      items = items.filter((r: any) => String(r.status_desc || '').toLowerCase().includes(s));
    }
    return {
      totale: d.count ?? 0,
      decreti: items.slice(0, 10).map((r: any) => ({
        titolo: r.title,
        identificativo: r.identifier,
        data_presentazione: r.date_presenting,
        stato: r.status_desc || r.status,
        data_stato: r.status_date,
        conversione: (r.conversion_act || {}).identifier,
        data_gu: r.publication_gu_date,
        normattiva_urn: r.source_url,
        url: r.source_url,
        fonte: 'Openpolis',
      })),
      fonte: 'Openpolis',
    };
  },

  async attivitaLegislativa(testo = '', tipo = '', stato = '', ramo = '') {
    const d = await op('bills_all/', {
      search: testo,
      type: tipo,
      branch: ramo,
      ordering: '-date_presenting',
      page_size: 15,
    });
    let items = d.results || [];
    if (stato) {
      const s = stato.toLowerCase();
      items = items.filter((r: any) => String((r.status || {}).phase || '').toLowerCase().includes(s));
    }
    return {
      totale: d.count ?? 0,
      atti: items.slice(0, 10).map((r: any) => {
        const st = r.status || {};
        return {
          titolo: r.title,
          identificativo: r.identifier,
          tipo: r.type,
          iniziativa: r.initiative,
          data: r.date_presenting,
          ramo: r.branch,
          stato: st.phase,
          data_stato: st.date,
          primi_firmatari: names(r.first_signers),
          relatori: names(r.relators),
          url: r.source_url,
          fonte: 'Openpolis',
        };
      }),
      fonte: 'Openpolis',
    };
  },

  async organiParlamentari(ramo = 'camera', tipo = 'groups') {
    ramo = (ramo || 'camera').toLowerCase();
    if (ramo !== 'camera' && ramo !== 'senato') ramo = 'camera';
    tipo = (tipo || 'groups').toLowerCase();
    if (!['groups', 'presidency', 'commission_councils'].includes(tipo)) tipo = 'groups';

    if (tipo === 'commission_councils') {
      const d = await op(`parl_assemblies/${ramo}/commission_councils/`);
      const out = (d.commissions_councils || []).slice(0, 30).map((c: any) => {
        const gp = c.groups_power || {};
        return {
          nome: c.name,
          tipo: c.classification,
          perc_donne: c.perc_women,
          forza_maggioranza: (gp.majority || {}).pp_sum,
          forza_opposizione: (gp.minority || {}).pp_sum,
        };
      });
      return { organo: `${ramo}/commissioni`, totale: out.length, organi: out, fonte: 'Openpolis' };
    }

    const d = await op(`parl_assemblies/${ramo}/presidency/`);
    const pres = d.presidency || {};
    const gp = pres.groups_power || {};

    if (tipo === 'presidency') {
      const out = (pres.components || []).slice(0, 20).map((c: any) => ({
        nome: c.name,
        ruolo: c.role,
        gruppo: (c.group || {}).acronym,
        immagine: c.image,
        slug: c.slug,
      }));
      return { organo: `${ramo}/presidenza`, totale: out.length, organi: out, eta_media: (pres.age || {}).avg, fonte: 'Openpolis' };
    }

    const gruppi: any[] = [];
    for (const [fazione, etichetta] of [['majority', 'maggioranza'], ['minority', 'opposizione']]) {
      for (const g of (gp[fazione] || {}).detail || []) {
        gruppi.push({
          acronimo: g.acronym,
          nome: g.name,
          ramo: g.branch,
          schieramento: etichetta,
          forza: (g.pp || {}).pp_branch,
          colore: g.color,
        });
      }
    }
    gruppi.sort((a, b) => (b.forza || 0) - (a.forza || 0));
    return {
      organo: `${ramo}/gruppi`,
      totale: gruppi.length,
      forza_maggioranza: (gp.majority || {}).pp_sum,
      forza_opposizione: (gp.minority || {}).pp_sum,
      organi: gruppi,
      fonte: 'Openpolis',
    };
  },
};
