UPDATE associations_deal_client
SET
    deal_id_pg = d.id_pg,
    client_id_pg = c.id_pg
FROM deals AS d, clients AS c
WHERE associations_deal_client.deal_id = d.id
  AND associations_deal_client.client_id = c.id
  AND (associations_deal_client.deal_id_pg IS NULL
       OR associations_deal_client.client_id_pg IS NULL);

UPDATE associations_deal_client
SET
    deal_id = d.id,
    client_id = c.id
FROM deals AS d, clients AS c
WHERE associations_deal_client.deal_id_pg = d.id_pg
  AND associations_deal_client.client_id_pg = c.id_pg
  AND (associations_deal_client.deal_id IS NULL
       OR associations_deal_client.client_id IS NULL);

UPDATE associations_deal_batiments
SET
    deal_id_pg = d.id_pg,
    batiments_id_pg = l.id_pg
FROM deals AS d, batiments AS l
WHERE associations_deal_batiments.deal_id = d.id
  AND associations_deal_batiments.batiments_id = l.id
  AND (associations_deal_batiments.deal_id_pg IS NULL
       OR associations_deal_batiments.batiments_id_pg IS NULL);

UPDATE associations_deal_batiments
SET
    deal_id = d.id,
    batiments_id = l.id
FROM deals AS d, batiments AS l
WHERE associations_deal_batiments.deal_id_pg = d.id_pg
  AND associations_deal_batiments.batiments_id_pg = l.id_pg
  AND (associations_deal_batiments.deal_id IS NULL
       OR associations_deal_batiments.batiments_id IS NULL);

UPDATE associations_contact_deal
SET
    deal_id_pg = d.id_pg,
    contact_id_pg = c.id_pg
FROM deals AS d, contacts AS c
WHERE associations_contact_deal.deal_id = d.id
  AND associations_contact_deal.contact_id = c.id
  AND (associations_contact_deal.deal_id_pg IS NULL
       OR associations_contact_deal.contact_id_pg IS NULL);

UPDATE associations_contact_deal
SET
    deal_id = d.id,
    contact_id = c.id
FROM deals AS d, contacts AS c
WHERE associations_contact_deal.deal_id_pg = d.id_pg
  AND associations_contact_deal.contact_id_pg = c.id_pg
  AND (associations_contact_deal.deal_id IS NULL
       OR associations_contact_deal.contact_id IS NULL);

UPDATE associations_deal_devis
SET
    deal_id_pg = d.id_pg,
    devis_id_pg = q.id_pg
FROM deals AS d, devis AS q
WHERE associations_deal_devis.deal_id = d.id
  AND associations_deal_devis.devis_id = q.id
  AND (associations_deal_devis.deal_id_pg IS NULL
       OR associations_deal_devis.devis_id_pg IS NULL);

UPDATE associations_deal_devis
SET
    deal_id = d.id,
    devis_id = q.id
FROM deals AS d, devis AS q
WHERE associations_deal_devis.deal_id_pg = d.id_pg
  AND associations_deal_devis.devis_id_pg = q.id_pg
  AND (associations_deal_devis.deal_id IS NULL
       OR associations_deal_devis.devis_id IS NULL);

UPDATE associations_contact_clients
SET
    contact_id_pg = c.id_pg,
    clients_id_pg = cl.id_pg
FROM contacts AS c, clients AS cl
WHERE associations_contact_clients.contact_id = c.id
  AND associations_contact_clients.clients_id = cl.id
  AND (associations_contact_clients.contact_id_pg IS NULL
       OR associations_contact_clients.clients_id_pg IS NULL);

UPDATE associations_contact_clients
SET
    contact_id = c.id,
    clients_id = cl.id
FROM contacts AS c, clients AS cl
WHERE associations_contact_clients.contact_id_pg = c.id_pg
  AND associations_contact_clients.clients_id_pg = cl.id_pg
  AND (associations_contact_clients.contact_id IS NULL
       OR associations_contact_clients.clients_id IS NULL);

UPDATE associations_contact_batiments
SET
    batiments_id_pg = l.id_pg,
    contact_id_pg = c.id_pg
FROM batiments AS l, contacts AS c
WHERE associations_contact_batiments.batiments_id = l.id
  AND associations_contact_batiments.contact_id = c.id
  AND (associations_contact_batiments.batiments_id_pg IS NULL
       OR associations_contact_batiments.contact_id_pg IS NULL);

UPDATE associations_contact_batiments
SET
    batiments_id = l.id,
    contact_id = c.id
FROM batiments AS l, contacts AS c
WHERE associations_contact_batiments.batiments_id_pg = l.id_pg
  AND associations_contact_batiments.contact_id_pg = c.id_pg
  AND (associations_contact_batiments.batiments_id IS NULL
       OR associations_contact_batiments.contact_id IS NULL);

UPDATE associations_devis_notes
SET
    devis_id_pg = q.id_pg,
    notes_id_pg = n.id_pg
FROM devis AS q, notes AS n
WHERE associations_devis_notes.devis_id = q.id
  AND associations_devis_notes.notes_id = n.id
  AND (associations_devis_notes.devis_id_pg IS NULL
       OR associations_devis_notes.notes_id_pg IS NULL);

UPDATE associations_devis_notes
SET
    devis_id = q.id,
    notes_id = n.id
FROM devis AS q, notes AS n
WHERE associations_devis_notes.devis_id_pg = q.id_pg
  AND associations_devis_notes.notes_id_pg = n.id_pg
  AND (associations_devis_notes.devis_id IS NULL
       OR associations_devis_notes.notes_id IS NULL);

UPDATE associations_deal_pros
SET
    deal_id_pg = d.id_pg,
    pro_id_pg = l.id_pg
FROM deals AS d, pros AS l
WHERE associations_deal_pros.deal_id = d.id
  AND associations_deal_pros.pro_id = l.id
  AND (associations_deal_pros.deal_id_pg IS NULL
       OR associations_deal_pros.pro_id_pg IS NULL);

UPDATE associations_deal_pros
SET
    deal_id = d.id,
    pro_id = l.id
FROM deals AS d, pros AS l
WHERE associations_deal_pros.deal_id_pg = d.id_pg
  AND associations_deal_pros.pro_id_pg = l.id_pg
  AND (associations_deal_pros.deal_id IS NULL
       OR associations_deal_pros.pro_id IS NULL);

UPDATE associations_batiments_notes
SET
    batiments_id_pg = q.id_pg,
    notes_id_pg = n.id_pg
FROM batiments AS q, notes AS n
WHERE associations_batiments_notes.batiments_id = q.id
  AND associations_batiments_notes.notes_id = n.id
  AND (associations_batiments_notes.batiments_id_pg IS NULL
       OR associations_batiments_notes.notes_id_pg IS NULL);

UPDATE associations_batiments_notes
SET
    batiments_id = q.id,
    notes_id = n.id
FROM batiments AS q, notes AS n
WHERE associations_batiments_notes.batiments_id_pg = q.id_pg
  AND associations_batiments_notes.notes_id_pg = n.id_pg
  AND (associations_batiments_notes.batiments_id IS NULL
       OR associations_batiments_notes.notes_id IS NULL);

UPDATE associations_notes_deal
SET
    deal_id_pg = q.id_pg,
    notes_id_pg = n.id_pg
FROM deals AS q, notes AS n
WHERE associations_notes_deal.deal_id = q.id
  AND associations_notes_deal.notes_id = n.id
  AND (associations_notes_deal.deal_id_pg IS NULL
       OR associations_notes_deal.notes_id_pg IS NULL);

UPDATE associations_notes_deal
SET
    deal_id = q.id,
    notes_id = n.id
FROM deals AS q, notes AS n
WHERE associations_notes_deal.deal_id_pg = q.id_pg
  AND associations_notes_deal.notes_id_pg = n.id_pg
  AND (associations_notes_deal.deal_id IS NULL
       OR associations_notes_deal.notes_id IS NULL);

UPDATE associations_batiments_clients
SET
    batiments_id_pg = l.id_pg,
    clients_id_pg = c.id_pg
FROM batiments AS l, clients AS c
WHERE associations_batiments_clients.batiments_id = l.id
  AND associations_batiments_clients.clients_id = c.id
  AND (associations_batiments_clients.batiments_id_pg IS NULL
       OR associations_batiments_clients.clients_id_pg IS NULL);

UPDATE associations_batiments_clients
SET
    batiments_id = l.id,
    clients_id = c.id
FROM batiments AS l, clients AS c
WHERE associations_batiments_clients.batiments_id_pg = l.id_pg
  AND associations_batiments_clients.clients_id_pg = c.id_pg
  AND (associations_batiments_clients.batiments_id IS NULL
       OR associations_batiments_clients.clients_id IS NULL);

UPDATE associations_devis_pros
SET
    devis_id_pg = d.id_pg,
    pro_id_pg = p.id_pg
FROM devis AS d, pros AS p
WHERE associations_devis_pros.devis_id = d.id
  AND associations_devis_pros.pro_id = p.id
  AND (associations_devis_pros.devis_id_pg IS NULL
       OR associations_devis_pros.pro_id_pg IS NULL);

UPDATE associations_devis_pros
SET
    devis_id = d.id,
    pro_id = p.id
FROM devis AS d, pros AS p
WHERE associations_devis_pros.devis_id_pg = d.id_pg
  AND associations_devis_pros.pro_id_pg = p.id_pg
  AND (associations_devis_pros.devis_id IS NULL
       OR associations_devis_pros.pro_id IS NULL);

UPDATE associations_deal_financeurs
SET
    deal_id_pg = d.id_pg,
    financeur_id_pg = p.id_pg
FROM deals AS d, financeurs AS p
WHERE associations_deal_financeurs.deal_id = d.id
  AND associations_deal_financeurs.financeur_id = p.id
  AND (associations_deal_financeurs.deal_id_pg IS NULL
       OR associations_deal_financeurs.financeur_id_pg IS NULL);


UPDATE associations_deal_financeurs
SET
    deal_id = d.id,
    financeur_id = p.id
FROM devis AS d, financeurs AS p
WHERE associations_deal_financeurs.deal_id_pg = d.id_pg
  AND associations_deal_financeurs.financeur_id_pg = p.id_pg
  AND (associations_deal_financeurs.deal_id IS NULL
       OR associations_deal_financeurs.financeur_id IS NULL);


UPDATE associations_contact_pro
SET
    contact_id_pg = c.id_pg,
    pros_id_pg = p.id_pg
FROM contacts AS c, pros AS p
WHERE associations_contact_pro.contact_id = c.id
  AND associations_contact_pro.pro_id = p.id
  AND (associations_contact_pro.contact_id_pg IS NULL
       OR associations_contact_pro.pros_id_pg IS NULL);


UPDATE associations_contact_pro
SET
    contact_id = c.id,
    pro_id = p.id
FROM contacts AS c, pros AS p
WHERE associations_contact_pro.contact_id_pg = c.id_pg
  AND associations_contact_pro.pros_id_pg = p.id_pg
  AND (associations_contact_pro.contact_id IS NULL
       OR associations_contact_pro.pro_id IS NULL);

UPDATE associations_notes_pro
SET
    pro_id = p.id,
    notes_id = n.id
FROM pros AS p, notes AS n
WHERE associations_notes_pro.pro_id_pg = p.id_pg
  AND associations_notes_pro.notes_id_pg = n.id_pg
  AND (associations_notes_pro.pro_id IS NULL
       OR associations_notes_pro.notes_id IS NULL);

UPDATE associations_notes_pro
SET
    pro_id_pg = p.id_pg,
    notes_id_pg = n.id_pg
FROM pros AS p, notes AS n
WHERE associations_notes_pro.pro_id = p.id
  AND associations_notes_pro.notes_id = n.id
  AND (associations_notes_pro.pro_id_pg IS NULL
       OR associations_notes_pro.notes_id_pg IS NULL);


UPDATE associations_deal_factures
SET
    facture_id = f.id,
    deal_id = d.id
FROM factures AS f, deals AS d
WHERE associations_deal_factures.facture_id_pg = f.id_pg
  AND associations_deal_factures.deal_id_pg = d.id_pg
  AND (associations_deal_factures.facture_id IS NULL
      OR associations_deal_factures.deal_id IS NULL);

UPDATE associations_deal_factures
SET
    facture_id_pg = f.id_pg,
    deal_id_pg = d.id_pg
FROM factures AS f, deals AS d
WHERE associations_deal_factures.facture_id = f.id
  AND associations_deal_factures.deal_id = d.id
  AND (associations_deal_factures.facture_id_pg IS NULL
      OR associations_deal_factures.deal_id_pg IS NULL);


UPDATE associations_devis_clients
SET
    client_id = c.id,
    devis_id = d.id
FROM clients AS c, devis AS d
WHERE associations_devis_clients.client_id_pg = c.id_pg
  AND associations_devis_clients.devis_id_pg = d.id_pg
  AND (associations_devis_clients.client_id IS NULL
      OR associations_devis_clients.devis_id IS NULL);

UPDATE associations_devis_clients
SET
    client_id_pg = c.id_pg,
    devis_id_pg = d.id_pg
FROM clients AS c, devis AS d
WHERE associations_devis_clients.client_id = c.id
  AND associations_devis_clients.devis_id = d.id
  AND (associations_devis_clients.client_id_pg IS NULL
      OR associations_devis_clients.devis_id_pg IS NULL);

UPDATE associations_devis_batiments
SET
    batiments_id = b.id,
    devis_id = d.id
FROM batiments AS b, devis AS d
WHERE associations_devis_batiments.batiments_id_pg = b.id_pg
  AND associations_devis_batiments.devis_id_pg = d.id_pg
  AND (associations_devis_batiments.batiments_id IS NULL
      OR associations_devis_batiments.devis_id IS NULL);

UPDATE associations_devis_batiments
SET
    batiments_id_pg = b.id_pg,
    devis_id_pg = d.id_pg
FROM batiments AS b, devis AS d
WHERE associations_devis_batiments.batiments_id = b.id
  AND associations_devis_batiments.devis_id = d.id
  AND (associations_devis_batiments.batiments_id_pg IS NULL
      OR associations_devis_batiments.devis_id_pg IS NULL);


UPDATE associations_clients_pro
SET
    pro_id = p.id,
    client_id = c.id
FROM pros AS p, clients AS c
WHERE associations_clients_pro.pro_id_pg = p.id_pg
  AND associations_clients_pro.client_id_pg = c.id_pg
  AND (associations_clients_pro.pro_id IS NULL
      OR associations_clients_pro.client_id IS NULL);

UPDATE associations_clients_pro
SET
    pro_id_pg = p.id_pg,
    client_id_pg = c.id_pg
FROM pros AS p, clients AS c
WHERE associations_clients_pro.pro_id = p.id
  AND associations_clients_pro.client_id = c.id
  AND (associations_clients_pro.pro_id_pg IS NULL
      OR associations_clients_pro.client_id_pg IS NULL);


UPDATE associations_batiments_pro
SET
    pro_id = p.id,
    batiments_id = b.id
FROM pros AS p, batiments AS b
WHERE associations_batiments_pro.pro_id_pg = p.id_pg
  AND associations_batiments_pro.batiments_id_pg = b.id_pg
  AND (associations_batiments_pro.pro_id IS NULL
      OR associations_batiments_pro.batiments_id IS NULL);

UPDATE associations_batiments_pro
SET
    pro_id_pg = p.id_pg,
    batiments_id_pg = b.id_pg
FROM pros AS p, batiments AS b
WHERE associations_batiments_pro.pro_id = p.id
  AND associations_batiments_pro.batiments_id = b.id
  AND (associations_batiments_pro.pro_id_pg IS NULL
      OR associations_batiments_pro.batiments_id_pg IS NULL);

