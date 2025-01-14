import { ICmdSchema, IGuildSchema, IUserSchema } from '@utils/Types';
import { Schema, model } from 'mongoose';

const cmdSchema = new Schema({
  _id: { type: String },
  maintenance: { type: Boolean, default: false },
  maintenanceReason: { type: String, default: '' },
});

const guildSchema = new Schema({
  id: { type: String, unique: true, index: true },
  blockedChannels: { type: Array, default: [] },
  disabledCommands: { type: Array, default: [] },
  lang: { type: String, default: 'pt-BR' },
});

const userSchema = new Schema({
  id: { type: String, unique: true, index: true },
  mamado: { type: Number, default: 0 },
  mamou: { type: Number, default: 0 },
  mamadas: { type: Number, default: 0 }, // Rename to mamado
  casado: { type: String, default: 'false' }, // Rename to married
  married: { type: String, default: null },
  info: { type: String, default: '' },
  nota: { type: String, default: 'Eu amo a Menhera >.<\nUse /sobremim!' }, // Rename to info
  data: { type: String, default: undefined }, // Rename to marriedDate
  marriedDate: { type: String, default: null },
  ban: { type: Boolean, default: false },
  banReason: { type: String, default: null },
  selectedColor: { type: String, default: '#a788ff' },
  cor: { type: String, default: '#a788ff' }, // Rename to selectedColors
  cores: { type: Array, default: [{ nome: '0 - Padrão', cor: '#a788ff', preço: 0 }] }, // Rename to colors
  colors: { type: Array, default: [] },
  caçados: { type: Number, default: 0 }, // Rename to demons
  demons: { type: Number, default: 0 },
  giants: { type: Number, default: 0 },
  angels: { type: Number, default: 0 },
  anjos: { type: Number, default: 0 }, // Rename to angels
  demigods: { type: Number, default: 0 },
  semideuses: { type: Number, default: 0 }, // Rename to demigods
  archangels: { type: Number, default: 0 },
  arcanjos: { type: Number, default: 0 }, // Rename to archangels
  gods: { type: Number, default: 0 },
  deuses: { type: Number, default: 0 }, // Rename to gods
  caçarTime: { type: String, default: '000000000000' }, // Rename to huntCooldown
  huntCooldown: { type: Number, default: 0 },
  rolls: { type: Number, default: 0 },
  estrelinhas: { type: Number, default: 0 },
  votos: { type: Number, default: 0 }, // Rename to votes
  votes: { type: Number, default: 0 },
  badges: { type: Array, default: [] },
  voteCooldown: { type: Number, default: 0 },
  trisal: { type: Array, default: [] },
  inventory: { type: Array, default: [] },
  inUseItems: { type: Array, default: [] },
  itemsLimit: { type: Number, default: 1 },
  lastCommandAt: { type: Number, default: 0 },
});

export const Cmds = model<ICmdSchema>('Cmd', cmdSchema);
export const Guilds = model<IGuildSchema>('guild', guildSchema);
export const Users = model<IUserSchema>('usersdb', userSchema);
