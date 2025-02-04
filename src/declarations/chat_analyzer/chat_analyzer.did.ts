export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'clearData': IDL.Func([], [IDL.Bool], []),
    'getAnalysis': IDL.Func([], [IDL.Opt(IDL.Text)], []),
    'getChat': IDL.Func([], [IDL.Opt(IDL.Text)], []),
    'saveAnalysis': IDL.Func([IDL.Text], [IDL.Bool], []),
    'saveChat': IDL.Func([IDL.Text], [IDL.Bool], [])
  });
};

export const init = ({ IDL }) => { return []; };