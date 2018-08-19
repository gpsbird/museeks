import types from '../constants/action-types';
import * as utils from '../utils/utils';
import { Action, TrackModel, SortBy, SortOrder } from '../types/interfaces';

export interface LibrarySort {
  by: SortBy;
  order: SortOrder;
}

export interface LibraryState {
  tracks: {
    library: TrackModel[]; // List of tracks in Library view
    playlist: TrackModel[]; // List of tracks in Playlist view
  };
  search: string;
  sort: LibrarySort;
  loading: boolean;
  refreshing: boolean;
  refresh: {
    processed: number;
    total: number;
  };
}

const initialState: LibraryState = {
  tracks: {
    library: [],
    playlist: []
  },
  search: '',
  sort: {
    by: SortBy.ARTIST,
    order: SortOrder.ASC
  },
  loading: true,
  refreshing: false,
  refresh: {
    processed: 0,
    total: 0
  }
};

export default (state = initialState, action: Action): LibraryState => {
  switch (action.type) {
    case (types.APP_LIBRARY_REFRESH): {
      return {
        ...state,
        tracks: {
          library: [...action.payload.tracks],
          playlist: []
        },
        loading: false
      };
    }

    case (types.APP_LIBRARY_SORT): {
      const { sortBy } = action.payload;
      const prevSort = state.sort;

      if (sortBy === prevSort.by) {
        return {
          ...state,
          sort: {
            ...state.sort,
            order: prevSort.order === SortOrder.ASC ? SortOrder.DSC : SortOrder.ASC
          }
        };
      }

      return {
        ...state,
        sort: {
          by: sortBy,
          order: SortOrder.ASC
        }
      };
    }

    case (types.APP_FILTER_SEARCH): {
      return {
        ...state,
        search: utils.stripAccents(action.payload.search)
      };
    }

    // case (types.APP_LIBRARY_ADD_FOLDERS): { // TODO Redux -> move to a thunk
    //   const { folders } = action.payload;
    //   let musicFolders = app.config.get('musicFolders');

    //   // Check if we received folders
    //   if (folders !== undefined) {
    //     musicFolders = musicFolders.concat(folders);

    //     // Remove duplicates, useless children, ect...
    //     musicFolders = utils.removeUselessFolders(musicFolders);

    //     musicFolders.sort();

    //     app.config.set('musicFolders', musicFolders);
    //     app.config.saveSync();
    //   }

    //   return { ...state };
    // }

    // case (types.APP_LIBRARY_REMOVE_FOLDER): { // TODO Redux -> move to a thunk
    //   if (!state.library.refreshing) {
    //     const musicFolders = app.config.get('musicFolders');

    //     musicFolders.splice(action.index, 1);

    //     app.config.set('musicFolders', musicFolders);
    //     app.config.saveSync();

    //     return { ...state };
    //   }

    //   return state;
    // }

    case (types.APP_LIBRARY_RESET): {
      return initialState;
    }

    case (types.APP_LIBRARY_REFRESH_START): {
      return {
        ...state,
        refreshing: true
      };
    }

    case (types.APP_LIBRARY_REFRESH_END): {
      return {
        ...state,
        refreshing: false,
        refresh: {
          processed: 0,
          total: 0
        }
      };
    }

    case (types.APP_LIBRARY_REFRESH_PROGRESS): {
      return {
        ...state,
        refresh: {
          processed: action.payload.processed,
          total: action.payload.total
        }
      };
    }

    case (types.APP_LIBRARY_REMOVE_TRACKS): {
      const { tracksIds } = action.payload;
      const removeTrack = (track: TrackModel) => !tracksIds.includes(track._id);

      const tracks = {
        library: [...state.tracks.library].filter(removeTrack),
        playlist: [...state.tracks.playlist].filter(removeTrack)
      };

      return {
        ...state,
        tracks
      };
    }

    case (types.APP_PLAYLISTS_LOAD_ONE): {
      const newState = { ...state };
      newState.tracks.playlist = [...action.payload.tracks];

      return newState;
    }

    default: {
      return state;
    }
  }
};